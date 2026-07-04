import os
import logging
import spacy
from typing import Dict, Any, List

# Base backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# Define paths to custom spaCy models
model_path1 = os.path.join(MODEL_DIR, "model-best")
model_path2 = os.path.join(MODEL_DIR, "2")
model_path3 = os.path.join(MODEL_DIR, "3")

# Memory cache for lazy loading spaCy and Transformer models
_spacy_models_cache: Dict[int, Any] = {}
_transformer_pipeline = None
_transformer_model_name = os.environ.get("NER_TRANSFORMER_MODEL", "dslim/distilbert-NER")

def get_spacy_model(level: int = 1):
    """
    Lazy load spaCy models into memory cache with graceful fallback to standard en_core_web models.
    """
    if level in _spacy_models_cache:
        return _spacy_models_cache[level]
    
    path = model_path1 if level == 1 else (model_path2 if level == 2 else model_path3)
    fallback = "en_core_web_sm" if level == 1 else ("en_core_web_md" if level == 2 else "en_core_web_lg")
    
    try:
        if os.path.exists(path):
            logging.info(f"Lazy loading spaCy model from {path}...")
            _spacy_models_cache[level] = spacy.load(path)
        else:
            logging.info(f"Custom model not found at {path}. Loading fallback '{fallback}'...")
            try:
                _spacy_models_cache[level] = spacy.load(fallback)
            except OSError:
                logging.warning(f"Fallback {fallback} not installed. Loading blank en model...")
                _spacy_models_cache[level] = spacy.blank("en")
    except Exception as e:
        logging.error(f"Error loading spaCy model level {level}: {e}. Falling back to blank model.")
        _spacy_models_cache[level] = spacy.blank("en")
        
    return _spacy_models_cache[level]

def get_transformer_pipeline():
    """
    Lazy load HuggingFace Transformer NER pipeline (using lightweight DistilBERT by default).
    """
    global _transformer_pipeline
    if _transformer_pipeline is None:
        try:
            from transformers import pipeline
            logging.info(f"Loading Transformer NER pipeline: {_transformer_model_name}...")
            try:
                _transformer_pipeline = pipeline("ner", model=_transformer_model_name, aggregation_strategy="simple")
            except TypeError:
                _transformer_pipeline = pipeline("ner", model=_transformer_model_name, grouped_entities=True)
            logging.info("Transformer NER pipeline loaded successfully.")
        except ImportError:
            logging.warning("Transformers library not installed. Transformer NER will fallback to spaCy.")
            return None
        except Exception as e:
            logging.error(f"Error loading transformer model {_transformer_model_name}: {e}. Falling back to spaCy NER.")
            return None
    return _transformer_pipeline

def redact_entities_spacy(text: str, level: int = 1) -> str:
    """
    Unified spaCy NER redaction function.
    Uses character-span slice replacement (O(n log n)) sorted descending to prevent O(n²) str.replace() clobbering.
    """
    if not text or not isinstance(text, str):
        return text
    
    doc = get_spacy_model(level)(text)
    entities = []
    for ent in doc.ents:
        if ent.text and ent.text.strip():
            entities.append({
                "start": ent.start_char,
                "end": ent.end_char,
                "text": ent.text
            })
            
    # Sort descending by start index so earlier replacements don't shift subsequent character indices
    entities_sorted = sorted(entities, key=lambda x: x["start"], reverse=True)
    
    redacted_text = text
    for ent in entities_sorted:
        start, end = ent["start"], ent["end"]
        if start is not None and end is not None and 0 <= start < len(redacted_text) and end <= len(redacted_text):
            mask = 'x' * (end - start)
            redacted_text = redacted_text[:start] + mask + redacted_text[end:]
            
    return redacted_text

def redact_entities_transformer(text: str, mask_char: str = "x") -> str:
    """
    Redact named entities using deep learning Transformer model (DistilBERT/RoBERTa).
    Falls back to spaCy Level 1 if transformers cannot be loaded.
    """
    if not text or not isinstance(text, str):
        return text

    pipe = get_transformer_pipeline()
    if pipe is None:
        return redact_entities_spacy(text, level=1)

    try:
        entities = pipe(text)
        entities_sorted = sorted(entities, key=lambda x: x.get('start', 0), reverse=True)
        redacted_text = text
        for ent in entities_sorted:
            word = ent.get('word', '')
            score = ent.get('score', 0.0)
            if score > 0.40 and word and len(word.strip()) > 1:
                start, end = ent.get('start'), ent.get('end')
                if start is not None and end is not None and 0 <= start < len(redacted_text) and end <= len(redacted_text):
                    mask = mask_char * (end - start)
                    redacted_text = redacted_text[:start] + mask + redacted_text[end:]
        return redacted_text
    except Exception as e:
        logging.error(f"Error in transformer redaction: {e}")
        return redact_entities_spacy(text, level=1)
