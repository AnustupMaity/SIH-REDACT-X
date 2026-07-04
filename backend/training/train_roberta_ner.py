"""
Fine-tuning script for RoBERTa / BERT on PII Named Entity Recognition dataset.
Requires: transformers, torch, datasets, accelerate, evaluate
"""

import os
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "pii_training_dataset.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "roberta_ner_model")

def main():
    try:
        from transformers import AutoTokenizer, AutoModelForTokenClassification, Trainer, TrainingArguments, DataCollatorForTokenClassification
        from datasets import Dataset
        import torch
    except ImportError:
        logger.error("Please install training dependencies: pip install transformers torch datasets accelerate evaluate")
        return

    logger.info("Loading training dataset...")
    if not os.path.exists(DATASET_PATH):
        logger.error(f"Dataset not found at {DATASET_PATH}. Please run generate_pii_dataset.py first.")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Convert to HuggingFace Dataset format (Comprehensive 9-Class PII & NER)
    label_list = [
        "O", "B-PER", "I-PER", "B-ORG", "I-ORG", "B-LOC", "I-LOC", 
        "B-MONEY", "I-MONEY", "B-ORDER", "I-ORDER", "B-DATE", "I-DATE", 
        "B-GOV_ID", "I-GOV_ID", "B-EMAIL", "I-EMAIL", "B-PHONE", "I-PHONE", 
        "B-MISC", "I-MISC"
    ]
    label_to_id = {label: i for i, label in enumerate(label_list)}
    
    formatted_records = []
    for record in raw_data:
        tags_id = [label_to_id.get(tag, 0) for tag in record["ner_tags"]]
        formatted_records.append({
            "tokens": record["tokens"],
            "ner_tags": tags_id
        })

    dataset = Dataset.from_list(formatted_records)
    split_dataset = dataset.train_test_split(test_size=0.1)

    model_name = "roberta-base"
    logger.info(f"Loading tokenizer and base model: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, add_prefix_space=True)
    model = AutoModelForTokenClassification.from_pretrained(model_name, num_labels=len(label_list))

    def tokenize_and_align_labels(examples):
        tokenized_inputs = tokenizer(examples["tokens"], truncation=True, is_split_into_words=True)
        labels = []
        for i, label in enumerate(examples["ner_tags"]):
            word_ids = tokenized_inputs.word_ids(batch_index=i)
            previous_word_idx = None
            label_ids = []
            for word_idx in word_ids:
                if word_idx is None:
                    label_ids.append(-100)
                elif word_idx != previous_word_idx:
                    label_ids.append(label[word_idx])
                else:
                    label_ids.append(-100)
                previous_word_idx = word_idx
            labels.append(label_ids)
        tokenized_inputs["labels"] = labels
        return tokenized_inputs

    tokenized_datasets = split_dataset.map(tokenize_and_align_labels, batched=True)
    data_collator = DataCollatorForTokenClassification(tokenizer)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        eval_strategy="steps",
        eval_steps=100,
        learning_rate=3e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        gradient_accumulation_steps=2,
        fp16=torch.cuda.is_available(),  # Half-precision FP16 keeps GPU memory footprint <3.5GB!
        max_steps=500,  # Optimized for ~15-25 min training on standard GPU/CPU
        weight_decay=0.01,
        save_strategy="steps",
        save_steps=250,
        save_total_limit=1,
        logging_steps=20,
        dataloader_num_workers=0,
        push_to_hub=False,
    )

    import numpy as np

    def compute_metrics(p):
        predictions, labels = p
        predictions = np.argmax(predictions, axis=2)

        true_predictions = [
            [label_list[pred] for (pred, lbl) in zip(prediction, label) if lbl != -100]
            for prediction, label in zip(predictions, labels)
        ]
        true_labels = [
            [label_list[lbl] for (pred, lbl) in zip(prediction, label) if lbl != -100]
            for prediction, label in zip(predictions, labels)
        ]

        flat_preds = [p for sublist in true_predictions for p in sublist]
        flat_labels = [l for sublist in true_labels for l in sublist]

        correct = sum(p == l for p, l in zip(flat_preds, flat_labels))
        total = len(flat_labels)
        accuracy = correct / total if total > 0 else 0.0

        tp = sum((p == l) and (l != "O") for p, l in zip(flat_preds, flat_labels))
        fp = sum((p != l) and (p != "O") for p, l in zip(flat_preds, flat_labels))
        fn = sum((p != l) and (l != "O") for p, l in zip(flat_preds, flat_labels))

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        return {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "accuracy": round(accuracy, 4),
        }

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["test"],
        processing_class=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    logger.info("Starting RoBERTa NER training...")
    trainer.train()
    
    logger.info("Running final evaluation on test dataset...")
    eval_metrics = trainer.evaluate()
    logger.info("==========================================")
    logger.info("FINAL EVALUATION METRICS:")
    for k, v in eval_metrics.items():
        logger.info(f"  {k}: {v}")
    logger.info("==========================================")
    
    logger.info(f"Saving fine-tuned RoBERTa model to {OUTPUT_DIR}...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    logger.info("Training complete!")

if __name__ == "__main__":
    main()
