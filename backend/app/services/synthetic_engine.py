import re
import random
from typing import List, Dict, Pattern
from app.services.regex_engine import (
    URL_PATTERN, EMAIL_PATTERN, IP_ADDRESS_PATTERN,
    AADHAAR_PATTERN, PAN_PATTERN, TAN_PATTERN, SSN_PATTERN,
    PASSPORT_PATTERN, DRIVER_LICENSE_PATTERN, CARD_NUMBER_PATTERN,
    PHONE_PATTERN, MONEY_PATTERN, POSTAL_CODE_PATTERN, BANK_ACCOUNT_PATTERN
)
from app.services.ner_engine import get_spacy_model, get_transformer_pipeline

# Realistic Synthetic Data Pools for Indian & Global PII
SYNTHETIC_NAMES = [
    "Aarav Sharma", "Vikram Patel", "Priya Nair", "Aditya Verma", "Ananya Iyer",
    "Rohan Gupta", "Siddharth Rao", "Kavya Desai", "Rajesh Khanna", "Pooja Mehta",
    "John Smith", "Elena Rostova", "Chen Wei", "David Miller", "Sarah Jenkins",
    "Michael Chang", "Amira Al-Fassi", "Lucas Silva", "Emily Watson", "Daniel Liam"
]

SYNTHETIC_ORGS = [
    "Apex Systems India Ltd", "Global Defense Tech Corp", "TechCorp Solutions",
    "SecureNet Industries", "Vanguard Financial Services", "Quantum Data Analytics",
    "Pinnacle Healthcare Pvt Ltd", "Horizon Logistics", "CyberShield Consulting", "Zenith Technologies"
]

SYNTHETIC_LOCATIONS = [
    "Bengaluru, Karnataka", "Mumbai, Maharashtra", "New Delhi", "Hyderabad, Telangana",
    "Pune, Maharashtra", "London, UK", "Tokyo, Japan", "New York, USA", "Singapore", "Frankfurt, Germany"
]

SYNTHETIC_EMAILS = [
    "operator.secure@redactx-anon.org", "contact.privacy@synthetic-vault.in",
    "info.masked@data-shield.gov", "audit.log@zero-retention.com", "user.sanitized@defense-net.org"
]

SYNTHETIC_PHONES = [
    "+91 98765 43210", "+91 98111 22334", "+91 99000 11223",
    "+1 (555) 019-2834", "+44 20 7946 0921", "+81 3 5555 0143"
]

SYNTHETIC_AADHAARS = [
    "9182 7364 5019", "4521 8903 6712", "7382 9102 3456", "8192 0394 8576"
]

SYNTHETIC_PANS = [
    "ABCDE1234F", "XYZP9876Q", "MNBK5432L", "PRTS6789W", "LKTJ2345M"
]

SYNTHETIC_BANKS = [
    "10293847561234", "98765432109876", "56473829102938", "34251678901234"
]

SYNTHETIC_MONEY = [
    "₹75,000", "₹12.5 Lakhs", "₹1.5 Crores", "$85,000 USD", "€45,000 EUR", "₹95,000"
]

def _get_random(pool: List[str]) -> str:
    return random.choice(pool)

def synthesize_regex(text: str) -> str:
    """
    Replaces structured regex PII matches with realistic synthetic equivalents
    to preserve document logic and formatting.
    """
    if not text or not isinstance(text, str):
        return text

    # Apply replacements using regex substitutions with random pool selections
    text = EMAIL_PATTERN.sub(lambda m: _get_random(SYNTHETIC_EMAILS), text)
    text = AADHAAR_PATTERN.sub(lambda m: _get_random(SYNTHETIC_AADHAARS), text)
    text = PAN_PATTERN.sub(lambda m: _get_random(SYNTHETIC_PANS), text)
    text = PHONE_PATTERN.sub(lambda m: _get_random(SYNTHETIC_PHONES), text)
    text = BANK_ACCOUNT_PATTERN.sub(lambda m: _get_random(SYNTHETIC_BANKS), text)
    text = MONEY_PATTERN.sub(lambda m: _get_random(SYNTHETIC_MONEY), text)
    text = URL_PATTERN.sub(lambda m: "https://secure-redactx.org/anonymized-resource", text)
    text = IP_ADDRESS_PATTERN.sub(lambda m: "192.168.100.200", text)
    
    return text

def synthesize_ner(text: str, level: int = 1) -> str:
    """
    Replaces named entities (PERSON, ORG, GPE, LOC) identified by spaCy/Transformers
    with realistic synthetic names, companies, and cities.
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
                "label": ent.label_,
                "text": ent.text
            })

    # Sort descending by start index to avoid index shifting during replacement
    entities_sorted = sorted(entities, key=lambda x: x["start"], reverse=True)
    
    syn_text = text
    for ent in entities_sorted:
        start, end, label = ent["start"], ent["end"], ent["label"]
        if 0 <= start < len(syn_text) and end <= len(syn_text):
            replacement = ent["text"]
            if label in ["PERSON", "PER"]:
                replacement = _get_random(SYNTHETIC_NAMES)
            elif label in ["ORG", "COMPANY"]:
                replacement = _get_random(SYNTHETIC_ORGS)
            elif label in ["GPE", "LOC", "CITY"]:
                replacement = _get_random(SYNTHETIC_LOCATIONS)
            elif label in ["MONEY", "CURRENCY"]:
                replacement = _get_random(SYNTHETIC_MONEY)
            elif label in ["DATE", "TIME"]:
                replacement = "[SYNTHETIC_DATE]"
            else:
                replacement = f"[SYNTHETIC_{label}]"
                
            syn_text = syn_text[:start] + replacement + syn_text[end:]

    return syn_text

def anonymize_with_synthetic_data(text: str, level: int = 5) -> str:
    """
    Full gradational synthetic anonymization pipeline.
    Strips specificity and generates a realistic synthetic document with identical logical structure.
    """
    if not text or not isinstance(text, str):
        return text

    # Step 1: Synthesize structured identifiers (PAN, Aadhaar, Phone, Bank, Email)
    step1 = synthesize_regex(text)
    
    # Step 2: Synthesize NLP Named Entities (Names, Orgs, Locations)
    spacy_level = 1 if level <= 2 else (2 if level == 3 else 3)
    step2 = synthesize_ner(step1, level=spacy_level)

    return step2
