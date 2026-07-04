"""
Real PII & NER Dataset Downloader & Loader
Downloads massive real-world PII/NER datasets from Hugging Face Hub (e.g. conll2003, ai4privacy)
or loads user-provided Kaggle CSV/JSON files, formatting them into our unified CoNLL 9-Class format.
"""

import os
import json
import logging
import argparse

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(BASE_DIR, "pii_training_dataset.json")

# CoNLL-2003 integer to string label mapping
CONLL_MAP = {
    0: "O",
    1: "B-PER",
    2: "I-PER",
    3: "B-ORG",
    4: "I-ORG",
    5: "B-LOC",
    6: "I-LOC",
    7: "B-MISC",
    8: "I-MISC"
}

def load_real_hf_dataset(max_samples=10000):
    """
    Download real-world NER benchmark dataset (Babelscape/wikineural) from Hugging Face Hub using streaming.
    No API credentials needed! Works instantly without downloading multi-GB archives to disk.
    """
    logger.info(f"Streaming up to {max_samples} real NER sentences from 'Babelscape/wikineural' on Hugging Face Hub...")
    try:
        from datasets import load_dataset
        dataset = load_dataset("Babelscape/wikineural", split="train_en", streaming=True)
        
        real_records = []
        count = 0
        for row in dataset:
            if count >= max_samples:
                break
            tokens = row.get("tokens", [])
            tags_int = row.get("ner_tags", [])
            if not tokens or not tags_int or len(tokens) != len(tags_int):
                continue
                
            tags_str = [CONLL_MAP.get(t, "O") for t in tags_int]
            text = " ".join(tokens)
            
            # Generate character spans for spaCy / fallback
            spacy_ents = []
            curr_idx = 0
            for tok, tag in zip(tokens, tags_str):
                start = text.find(tok, curr_idx)
                if start != -1:
                    end = start + len(tok)
                    curr_idx = end
                    if tag.startswith("B-") or tag.startswith("I-"):
                        ent_type = tag.split("-")[1]
                        if ent_type != "MISC":
                            spacy_ents.append([start, end, ent_type])
                            
            real_records.append({
                "text": text,
                "tokens": tokens,
                "ner_tags": tags_str,
                "spacy_entities": spacy_ents,
                "source": "huggingface_real_wikineural"
            })
            count += 1
            
        logger.info(f"Successfully streamed and processed {len(real_records)} real NER records!")
        return real_records
    except Exception as e:
        logger.error(f"Could not download dataset from HuggingFace: {e}")
        return []

def load_kaggle_or_local_file(file_path):
    """
    Load user provided Kaggle or local JSON/CSV PII dataset.
    """
    logger.info(f"Checking for local dataset file: {file_path}...")
    if not os.path.exists(file_path):
        return []
        
    try:
        if file_path.endswith(".json"):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.info(f"Loaded {len(data)} records from local JSON: {file_path}")
            return data
        elif file_path.endswith(".csv"):
            import pandas as pd
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} records from local CSV: {file_path}")
            # Assume dataframe has 'text' and 'tokens'/'ner_tags' or similar
            records = []
            for _, row in df.iterrows():
                if "tokens" in row and "ner_tags" in row:
                    records.append({
                        "text": str(row.get("text", "")),
                        "tokens": json.loads(row["tokens"]) if isinstance(row["tokens"], str) else row["tokens"],
                        "ner_tags": json.loads(row["ner_tags"]) if isinstance(row["ner_tags"], str) else row["ner_tags"],
                        "spacy_entities": [],
                        "source": "kaggle_local_csv"
                    })
            return records
    except Exception as e:
        logger.error(f"Error reading local file {file_path}: {e}")
    return []

def main():
    parser = argparse.ArgumentParser(description="Download & merge real PII/NER datasets for training")
    parser.add_argument("--max_samples", type=int, default=10000, help="Maximum number of real samples to download (default 10,000 for fast ~30 min GPU training)")
    parser.add_argument("--local_file", type=str, default=None, help="Path to local Kaggle CSV/JSON dataset file if you downloaded one manually")
    args = parser.parse_args()
    
    combined_dataset = []
    
    # 1. Load existing dataset (our 1,000 multi-class financial/order/govid records)
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
                logger.info(f"Loaded {len(existing)} existing multi-class records from {OUTPUT_FILE}")
                combined_dataset.extend(existing)
        except Exception as e:
            logger.warning(f"Error reading existing dataset: {e}")
            
    # 2. Load local Kaggle file if specified
    if args.local_file:
        local_data = load_kaggle_or_local_file(args.local_file)
        combined_dataset.extend(local_data)
        
    # 3. Stream real-world NER dataset from HuggingFace
    hf_data = load_real_hf_dataset(max_samples=args.max_samples)
    combined_dataset.extend(hf_data)
    
    logger.info(f"Total Combined Training Dataset Size: {len(combined_dataset)} records!")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(combined_dataset, f, indent=2, ensure_ascii=False)
        
    logger.info(f"Unified Real + Synthetic PII Dataset saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
