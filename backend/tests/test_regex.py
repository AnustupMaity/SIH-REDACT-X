import pytest
from app.services.regex_engine import redact_all

def test_url_and_email_redaction():
    text = "Contact rajesh.sharma@tcs.com or visit https://www.tcs.com/security for details."
    redacted = redact_all(text)
    assert "rajesh.sharma@tcs.com" not in redacted
    assert "https://www.tcs.com/security" not in redacted
    assert "Contact" in redacted and "for details" in redacted

def test_indian_pii_redaction():
    text = "My Aadhaar is 5485-6985-1245 and PAN is ABCDE1234F. Phone: +91-9876543210."
    redacted = redact_all(text)
    assert "5485-6985-1245" not in redacted
    assert "ABCDE1234F" not in redacted
    assert "+91-9876543210" not in redacted
    assert len(redacted) == len(text)

def test_global_pii_redaction():
    text = "SSN: 123-45-6789, Passport: P98765432, Driver License: D123-456-789."
    redacted = redact_all(text)
    assert "123-45-6789" not in redacted
    assert "P98765432" not in redacted
    assert "D123-456-789" not in redacted

def test_financial_and_contextual_cvv():
    text = "Card 4532-7890-1234-5678 with CVV 456 expiring on 12-05-2025. Cost is Rs. 18,50,000."
    redacted = redact_all(text)
    assert "4532-7890-1234-5678" not in redacted
    assert "456" not in redacted
    assert "18,50,000" not in redacted
    # Ensure year or unrelated 3 digit number in standard text isn't randomly clobbered without context
    normal_text = "There are 456 apples on page 2025 of the book."
    assert redact_all(normal_text) == normal_text

def test_contextual_bank_account():
    text = "Please transfer to Bank Account 123456789012345 or A/C 987654321000."
    redacted = redact_all(text)
    assert "123456789012345" not in redacted
    assert "987654321000" not in redacted
