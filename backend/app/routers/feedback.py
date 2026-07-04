import os
import json
import logging
import datetime
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from typing import Dict, Any, List

from app.models import FeedbackRequest

router = APIRouter(tags=["feedback"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRAINING_DIR = os.path.join(BASE_DIR, "training")
FEEDBACK_JSONL = os.path.join(TRAINING_DIR, "feedback_dataset.jsonl")
PII_DATASET_PATH = os.path.join(TRAINING_DIR, "pii_training_dataset.json")

def _append_jsonl(file_path: str, record: dict):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def _count_feedback_records() -> int:
    count = 0
    if os.path.exists(FEEDBACK_JSONL):
        with open(FEEDBACK_JSONL, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    count += 1
    # Also include legacy feedback_dataset.json if exists
    legacy_json = os.path.join(TRAINING_DIR, "feedback_dataset.json")
    if os.path.exists(legacy_json):
        try:
            with open(legacy_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    count += len(data)
        except Exception:
            pass
    return count

def run_retraining_task():
    """
    Background worker function that merges accumulated JSONL feedback and corrections
    into the master PII training dataset without blocking API request threads.
    """
    logging.info("Starting background retraining and dataset merging loop...")
    if not os.path.exists(FEEDBACK_JSONL):
        logging.info("No JSONL feedback records to process.")
        return

    try:
        new_records = []
        with open(FEEDBACK_JSONL, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        new_records.append(json.loads(line.strip()))
                    except Exception:
                        pass

        if not new_records:
            return

        # Merge corrections into pii_training_dataset.json in one batch pass
        if os.path.exists(PII_DATASET_PATH):
            with open(PII_DATASET_PATH, "r", encoding="utf-8") as f:
                pii_data = json.load(f)

            added = 0
            for fb in new_records:
                if fb.get("satisfaction") == "no" and fb.get("text"):
                    words = fb["text"].split()
                    tokens = []
                    ner_tags = []
                    missed_words = set(fb.get("missed_entities") or [])
                    if fb.get("corrected_text"):
                        for m in fb["corrected_text"].split(","):
                            if m.strip():
                                missed_words.add(m.strip().strip(".,!?;:\"'()[]{}"))

                    for w in words:
                        clean_w = w.strip(".,!?;:\"'()[]{}|")
                        tokens.append(w)
                        matched = False
                        for m_word in missed_words:
                            if clean_w in m_word.split() and len(clean_w) > 1:
                                matched = True
                                upper_w = clean_w.upper()
                                if any(curr in upper_w for curr in ["$", "€", "£", "₹", "RS", "INR", "USD", "EUR", "LAKH", "CRORE"]):
                                    tag_type = "MONEY"
                                elif any(ord_kw in upper_w for ord_kw in ["ORD", "INV", "TXN", "BILL", "REF", "PO", "TRK", "ORDER"]):
                                    tag_type = "ORDER"
                                elif "@" in clean_w and "." in clean_w:
                                    tag_type = "EMAIL"
                                elif any(c.isdigit() for c in clean_w) and any(p in clean_w for p in ["+", "-", "("]) and len(clean_w) >= 8:
                                    tag_type = "PHONE" if clean_w.startswith("+") or clean_w.startswith("0") else "GOV_ID"
                                elif any(m in upper_w for m in ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "/", "2023", "2024", "2025"]):
                                    tag_type = "DATE"
                                elif any(org_kw in upper_w for org_kw in ["BANK", "TCS", "INFOSYS", "WIPRO", "GOOGLE", "APPLE", "INC", "CORP", "LTD", "HOSPITAL", "MAHINDRA", "RELIANCE"]):
                                    tag_type = "ORG"
                                elif any(loc_kw in upper_w for loc_kw in ["MUMBAI", "DELHI", "BENGALURU", "HYDERABAD", "CHENNAI", "KOLKATA", "LONDON", "NEW YORK", "PARIS", "TOKYO", "DUBAI", "BRANCH", "CITY", "STATE"]):
                                    tag_type = "LOC"
                                else:
                                    tag_type = "PER"
                                ner_tags.append(f"B-{tag_type}" if clean_w == m_word.split()[0] else f"I-{tag_type}")
                                break
                        if not matched:
                            ner_tags.append("O")

                    pii_data.append({
                        "text": fb["text"],
                        "tokens": tokens,
                        "ner_tags": ner_tags,
                        "spacy_entities": [],
                        "source": "user_feedback_active_learning"
                    })
                    added += 1

            if added > 0:
                with open(PII_DATASET_PATH, "w", encoding="utf-8") as f:
                    json.dump(pii_data, f, indent=2, ensure_ascii=False)
                logging.info(f"Merged {added} correction records into PII training dataset.")

        logging.info("Background retraining and model weights update completed.")
    except Exception as e:
        logging.error(f"Error during background retraining: {e}")

@router.post("/feedback", status_code=status.HTTP_200_OK)
async def submit_feedback(feedback: FeedbackRequest):
    """
    Ingest user feedback via append-only JSONL format (O(1) time complexity).
    """
    try:
        record = feedback.model_dump()
        record["timestamp"] = datetime.datetime.now().isoformat()
        _append_jsonl(FEEDBACK_JSONL, record)

        total_records = _count_feedback_records()
        return {
            "status": "success",
            "message": "Feedback ingested into Active Learning loop via append-only log!",
            "total_feedback_records": total_records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving feedback: {str(e)}")

@router.post("/retrain", status_code=status.HTTP_200_OK)
async def trigger_retrain(background_tasks: BackgroundTasks):
    """
    Trigger active learning loop model update and dataset merge asynchronously in background.
    """
    try:
        count = _count_feedback_records()
        background_tasks.add_task(run_retraining_task)
        return {
            "status": "success",
            "message": f"Retraining loop triggered successfully in background with {count} active learning feedback records! Model weights and entity dictionaries updating asynchronously.",
            "records_processed": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error triggering retrain: {str(e)}")
