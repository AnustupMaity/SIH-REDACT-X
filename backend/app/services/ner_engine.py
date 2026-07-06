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
import time

# Default fallback cloud model
FALLBACK_TRANSFORMER_MODEL = "dslim/distilbert-NER"

def get_target_transformer_model():
    """
    Check for custom trained Transformer model paths or environment variables.
    Returns the path to the custom model if found, otherwise returns FALLBACK_TRANSFORMER_MODEL.
    """
    env_model = os.environ.get("NER_TRANSFORMER_MODEL")
    if env_model:
        return env_model
        
    # Check potential local trained model directories
    possible_paths = [
        os.path.join(BASE_DIR, "training", "roberta_ner_model"),
        os.path.join(MODEL_DIR, "roberta_ner_model"),
        os.path.join(MODEL_DIR, "roberta"),
        os.path.join(BASE_DIR, "roberta_ner_model")
    ]
    for path in possible_paths:
        if os.path.exists(path):
            logging.info(f"Auto-detected custom trained Transformer model at: {path}")
            return path
            
    return FALLBACK_TRANSFORMER_MODEL

_transformer_model_name = get_target_transformer_model()

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
    Lazy load HuggingFace Transformer NER pipeline.
    Tries to load the custom trained model up to 3 times before falling back to the downloaded cloud model.
    """
    global _transformer_pipeline
    if _transformer_pipeline is None:
        try:
            from transformers import pipeline
            
            target_model = get_target_transformer_model()
            models_to_try = []
            
            # If custom model is selected, attempt to load it up to 3 times
            if target_model != FALLBACK_TRANSFORMER_MODEL:
                for attempt_num in range(1, 4):
                    models_to_try.append((target_model, attempt_num, True))
            
            # Finally, add fallback cloud model as the last resort
            models_to_try.append((FALLBACK_TRANSFORMER_MODEL, 1, False))
            
            for model_path, attempt, is_custom in models_to_try:
                try:
                    if is_custom:
                        logging.info(f"Attempting to load custom trained Transformer model from '{model_path}' (Attempt {attempt} of 3)...")
                    else:
                        logging.info(f"Loading fallback downloaded cloud model '{model_path}'...")
                        
                    try:
                        _transformer_pipeline = pipeline("ner", model=model_path, aggregation_strategy="simple")
                    except TypeError:
                        _transformer_pipeline = pipeline("ner", model=model_path, grouped_entities=True)
                        
                    logging.info(f"Transformer NER pipeline successfully loaded using: {model_path}")
                    break
                except Exception as e:
                    if is_custom:
                        logging.warning(f"Failed to load custom model on Attempt {attempt}: {e}")
                        if attempt < 3:
                            time.sleep(1) # short pause before retry
                        else:
                            logging.warning(f"Custom trained model failed after 3 attempts! Switching to downloaded fallback model '{FALLBACK_TRANSFORMER_MODEL}'.")
                    else:
                        logging.error(f"Error loading fallback transformer model '{model_path}': {e}. Falling back to spaCy NER.")
                        return None
                        
        except ImportError:
            logging.warning("Transformers library not installed. Transformer NER will fallback to spaCy.")
            return None
        except Exception as e:
            logging.error(f"Unexpected error initializing Transformer pipeline: {e}. Falling back to spaCy NER.")
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

def preload_fallback_model():
    """
    Pre-download / cache the fallback cloud model at startup so there is zero download wait time during fallback.
    """
    try:
        from transformers import pipeline
        logging.info(f"Pre-downloading/caching fallback Transformer model '{FALLBACK_TRANSFORMER_MODEL}' at startup...")
        try:
            pipeline("ner", model=FALLBACK_TRANSFORMER_MODEL, aggregation_strategy="simple")
        except TypeError:
            pipeline("ner", model=FALLBACK_TRANSFORMER_MODEL, grouped_entities=True)
        logging.info("Fallback Transformer model successfully pre-cached at startup!")
    except Exception as e:
        logging.warning(f"Could not pre-cache fallback transformer model at startup: {e}")
