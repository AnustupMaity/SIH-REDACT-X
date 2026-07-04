import os
import logging
import spacy

# Get base directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define relative paths to models
model_path1 = os.path.join(BASE_DIR, "model", "model-best")
model_path2 = os.path.join(BASE_DIR, "model", "2")
model_path3 = os.path.join(BASE_DIR, "model", "3")

# Memory cache for lazy loading spaCy models
_models_cache = {}

def get_spacy_model(level=1):
    if level in _models_cache:
        return _models_cache[level]
    
    path = model_path1 if level == 1 else (model_path2 if level == 2 else model_path3)
    try:
        if os.path.exists(path):
            logging.info(f"Lazy loading spaCy model from {path}...")
            _models_cache[level] = spacy.load(path)
        else:
            logging.warning(f"Model not found at {path}. Trying fallback 'en_core_web_sm'...")
            _models_cache[level] = spacy.load("en_core_web_sm")
    except Exception as e:
        logging.error(f"Error loading model from {path}: {e}. Falling back to blank model.")
        _models_cache[level] = spacy.blank("en")
        
    return _models_cache[level]

def redact_entities1(text):
    if not text or not isinstance(text, str):
        return text
    doc = get_spacy_model(1)(text)
    redacted_text = text
    for ent in doc.ents:
        if ent.text and ent.text.strip():
            redacted_text = redacted_text.replace(ent.text, "xxxxx")
    return redacted_text

def redact_entities2(text):
    if not text or not isinstance(text, str):
        return text
    doc = get_spacy_model(2)(text)
    redacted_text = text
    for ent in doc.ents:
        if ent.text and ent.text.strip():
            redacted_text = redacted_text.replace(ent.text, "xxxxx")
    return redacted_text

def redact_entities3(text):
    if not text or not isinstance(text, str):
        return text
    doc = get_spacy_model(3)(text)
    redacted_text = text
    for ent in doc.ents:
        if ent.text and ent.text.strip():
            redacted_text = redacted_text.replace(ent.text, "xxxxx")
    return redacted_text
