# RE-DACT NER Training Suite (RoBERTa & spaCy)

This directory contains the custom PII dataset generator and fine-tuning scripts for **RE-DACT's Hybrid NER Architecture**. Our backend supports both lightweight spaCy models (Levels 2-4) and Deep Learning Transformer architectures like BERT and RoBERTa (Level 5).

## 1. Generate Synthetic PII Training Data
To generate a comprehensive synthetic training dataset containing Indian names, global names, organizations, cities, Aadhaar numbers, PAN cards, phone numbers, and emails formatted for both HuggingFace Transformers (CoNLL-2003) and spaCy:
```bash
python backend/training/generate_pii_dataset.py
```
This generates `pii_training_dataset.json` containing token-level `ner_tags` (`B-PER`, `I-PER`, `B-LOC`, etc.) and character span offsets.

## 2. Fine-Tune RoBERTa / BERT (Level 5 Deep Learning Model)
To fine-tune a pre-trained `roberta-base` or `bert-base-cased` model on the generated PII dataset using PyTorch and HuggingFace Transformers:
```bash
# Ensure PyTorch and Transformers are installed
pip install transformers torch datasets accelerate evaluate

# Run training
python backend/training/train_roberta_ner.py
```
The fine-tuned model and tokenizer will be saved in `backend/training/roberta_ner_model/` and can be set as the active transformer model by setting the environment variable:
```powershell
$env:NER_TRANSFORMER_MODEL = "C:\path\to\roberta_ner_model"
```

## 3. Fine-Tune spaCy NER Models (Levels 2-4 Lightweight Models)
To convert the training data into spaCy binary `.spacy` format and train lightweight custom models:
```bash
python backend/training/train_spacy_ner.py
```

## Why a Hybrid Architecture?
- **Lightweight & Fast (Levels 1-4):** Uses rule-based regex and spaCy statistical NER models (~10ms per document, minimal RAM usage, lazy-loaded on demand).
- **Deep Learning Precision (Level 5):** Uses Transformer neural networks (BERT/RoBERTa) to handle ambiguous context, complex multi-word entities, and zero-shot domain names.
