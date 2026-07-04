"""
Legacy wrapper for spaCy NER redaction functions.
Redirects to unified engine in app.services.ner_engine.
"""
from app.services.ner_engine import get_spacy_model, redact_entities_spacy

def redact_entities1(text):
    return redact_entities_spacy(text, level=1)

def redact_entities2(text):
    return redact_entities_spacy(text, level=2)

def redact_entities3(text):
    return redact_entities_spacy(text, level=3)
