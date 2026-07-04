import os
import logging

# Lazy loading of transformers pipeline for BERT / RoBERTa NER
_transformer_pipeline = None
_transformer_model_name = os.environ.get("NER_TRANSFORMER_MODEL", "dslim/bert-base-NER")

def get_transformer_pipeline():
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
            logging.warning("Transformers library not installed. Falling back to spaCy NER.")
            return None
        except Exception as e:
            logging.error(f"Error loading transformer model {_transformer_model_name}: {e}. Falling back to spaCy NER.")
            return None
    return _transformer_pipeline

def redact_entities_transformer(text, mask_char="xxxxx"):
    """
    Redact named entities (PER, ORG, LOC, MISC, etc.) using deep learning BERT/RoBERTa model.
    Falls back to spaCy Level 1 if transformers cannot be loaded.
    """
    if not text or not isinstance(text, str):
        return text

    pipe = get_transformer_pipeline()
    if pipe is None:
        # Fallback to spaCy NER if torch/transformers is not available
        from ner import redact_entities1
        return redact_entities1(text)

    try:
        entities = pipe(text)
        # Sort entities by start position descending so replacement doesn't shift string indices
        entities_sorted = sorted(entities, key=lambda x: x.get('start', 0), reverse=True)
        redacted_text = text
        for ent in entities_sorted:
            word = ent.get('word', '')
            score = ent.get('score', 0.0)
            if score > 0.40 and word and len(word.strip()) > 1:  # Confidence threshold
                start, end = ent.get('start'), ent.get('end')
                if start is not None and end is not None and start < len(redacted_text) and end <= len(redacted_text):
                    redacted_text = redacted_text[:start] + mask_char + redacted_text[end:]
                else:
                    redacted_text = redacted_text.replace(word, mask_char)
        return redacted_text
    except Exception as e:
        logging.error(f"Error in transformer redaction: {e}")
        from ner import redact_entities1
        return redact_entities1(text)
