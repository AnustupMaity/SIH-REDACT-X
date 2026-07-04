from app.services.regex_engine import redact_all
from app.services.ner_engine import redact_entities_spacy, redact_entities_transformer
from app.services.synthetic_engine import anonymize_with_synthetic_data

def redact_by_level(text: str, level: int, mode: str = "mask") -> str:
    """
    Apply additive redaction levels or realistic synthetic data anonymization.
    Higher levels layer AI/NLP entity recognition on top of structured regex rules.
    If mode == 'synthetic', replaces sensitive entities with realistic synthetic equivalents.
    """
    if not text or not isinstance(text, str):
        return text
    try:
        level = int(level)
    except (ValueError, TypeError):
        level = 1

    if level <= 0:
        return text

    # If user selected synthetic data generation mode or Level 5 Synthetic Replacement
    if mode == "synthetic":
        return anonymize_with_synthetic_data(text, level=level)

    # Apply structured Regex PII rules first for all levels >= 1
    redacted_text = redact_all(text)

    # Layer AI NER models on top of regex redaction
    if level == 2:
        return redact_entities_spacy(redacted_text, level=1)
    elif level == 3:
        return redact_entities_spacy(redacted_text, level=2)
    elif level == 4:
        return redact_entities_spacy(redacted_text, level=3)
    elif level >= 5:
        return redact_entities_transformer(redacted_text)

    return redacted_text
