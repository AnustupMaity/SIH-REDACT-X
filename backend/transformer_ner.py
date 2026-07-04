"""
Legacy wrapper for Transformer NER redaction function.
Redirects to unified engine in app.services.ner_engine.
"""
from app.services.ner_engine import redact_entities_transformer, get_transformer_pipeline
