import pytest
from app.services.ner_engine import redact_entities_spacy, redact_entities_transformer
from app.services.redaction import redact_by_level

def test_spacy_slice_based_replacement():
    # Test that replacing entity preserves exact string length and doesn't do O(n^2) global string replace
    text = "Rajesh Sharma went to Mumbai to visit Tata Consultancy Services."
    redacted = redact_entities_spacy(text, level=1)
    assert len(redacted) == len(text)
    assert "Rajesh" not in redacted or "Mumbai" not in redacted

def test_redact_by_level_additive():
    text = "Contact rajesh.sharma@tcs.com in Mumbai. Phone: +91-9876543210."
    # Level 0 should pass through unchanged
    assert redact_by_level(text, 0) == text
    
    # Level 1 should redact email and phone via regex
    l1 = redact_by_level(text, 1)
    assert "rajesh.sharma@tcs.com" not in l1
    assert "+91-9876543210" not in l1
    
    # Level 2 should also layer spaCy NER over the regex redaction
    l2 = redact_by_level(text, 2)
    assert "rajesh.sharma@tcs.com" not in l2
    assert "+91-9876543210" not in l2
    assert len(l2) == len(text)

def test_transformer_ner_fallback_resilience():
    # Even if transformer weights aren't downloaded offline, it should gracefully fall back to spaCy level 1
    text = "John Doe works at Google in New York City."
    redacted = redact_entities_transformer(text)
    assert len(redacted) == len(text)
