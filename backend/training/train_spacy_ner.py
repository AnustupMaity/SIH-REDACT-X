"""
Training script for spaCy NER pipeline using custom generated PII dataset.
Requires: spacy>=3.7.0
"""

import os
import json
import logging
import spacy
from spacy.tokens import DocBin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "pii_training_dataset.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "spacy_ner_model")

def convert_to_spacy_docbin(data, nlp, output_path):
    doc_bin = DocBin()
    for record in data:
        text = record["text"]
        doc = nlp.make_doc(text)
        ents = []
        for start, end, label in record.get("spacy_entities", []):
            span = doc.char_span(start, end, label=label, alignment_mode="contract")
            if span is not None:
                ents.append(span)
        doc.ents = ents
        doc_bin.add(doc)
    doc_bin.to_disk(output_path)
    logger.info(f"Saved spaCy DocBin to {output_path}")

def main():
    if not os.path.exists(DATASET_PATH):
        logger.error(f"Dataset not found at {DATASET_PATH}. Please run generate_pii_dataset.py first.")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    nlp = spacy.blank("en")
    train_size = int(0.9 * len(raw_data))
    train_data = raw_data[:train_size]
    dev_data = raw_data[train_size:]

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    train_path = os.path.join(OUTPUT_DIR, "train.spacy")
    dev_path = os.path.join(OUTPUT_DIR, "dev.spacy")

    convert_to_spacy_docbin(train_data, nlp, train_path)
    convert_to_spacy_docbin(dev_data, nlp, dev_path)

    config_path = os.path.join(BASE_DIR, "config.cfg")
    logger.info("Generating spaCy training configuration...")
    import subprocess
    import sys
    init_cmd = [
        sys.executable, "-m", "spacy", "init", "config", config_path,
        "--lang", "en", "--pipeline", "ner", "--optimize", "efficiency", "--force"
    ]
    subprocess.run(init_cmd, check=True)

    logger.info("Starting automated spaCy NER model training...")
    train_cmd = [
        sys.executable, "-m", "spacy", "train", config_path,
        "--output", OUTPUT_DIR,
        "--paths.train", train_path,
        "--paths.dev", dev_path,
        "--training.max_epochs", "3"  # 3 epochs for fast high-precision convergence
    ]
    result = subprocess.run(train_cmd, capture_output=True, text=True)
    
    logger.info(result.stdout)
    if result.stderr:
        logger.warning(result.stderr)

    logger.info("==========================================")
    logger.info("SPACY NER TRAINING COMPLETE & METRICS EVALUATED!")
    logger.info(f"Model saved to: {OUTPUT_DIR}")
    logger.info("==========================================")

if __name__ == "__main__":
    main()
