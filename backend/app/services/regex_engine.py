import re
from typing import List, Tuple, Pattern

# Pre-compiled Regex patterns ordered from most specific to least specific
# This prevents greedy generic patterns (like 3-4 digit CVV or 9-18 digit numbers) from clobbering specific IDs, dates, and phone numbers.

# 1. URLs & Web Links
URL_PATTERN: Pattern = re.compile(r'https?://(?:www\.)?[^\s/$.?#].[^\s]*', re.IGNORECASE)

# 2. Email Addresses
EMAIL_PATTERN: Pattern = re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.(?:gov\.in|[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?)', re.IGNORECASE)

# 3. Cryptographic Keys & Bitcoin Addresses
BITCOIN_ADDRESS_PATTERN: Pattern = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
HEX_PATTERN: Pattern = re.compile(r'\b[0-9a-fA-F]{32,64}\b')
CRYPTO_KEY_PATTERN: Pattern = re.compile(r'\b(?:ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|[A-Za-z0-9_-]{32,})\b')

# 4. IP Addresses & MAC Addresses
IPV4_PATTERN = r'(?:\d{1,3}\.){3}\d{1,3}'
IPV6_PATTERN = r'(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){0,6}::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}'
IP_ADDRESS_PATTERN: Pattern = re.compile(rf'\b({IPV4_PATTERN}|{IPV6_PATTERN})\b')
MAC_ADDRESS_PATTERN: Pattern = re.compile(r'\b([A-Fa-f0-9]{2}[:-]){5}[A-Fa-f0-9]{2}\b', re.IGNORECASE)

# 5. Government IDs (Aadhaar, PAN, TAN, SSN, Passport, Driver License)
AADHAAR_PATTERN: Pattern = re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b')
PAN_PATTERN: Pattern = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b')
TAN_PATTERN: Pattern = re.compile(r'\b[A-Z]{4}[0-9]{5}[A-Z]\b')
SSN_PATTERN: Pattern = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
PASSPORT_PATTERN: Pattern = re.compile(r'\b[A-Z]{1,2}[0-9]{6,9}\b')
DRIVER_LICENSE_PATTERN: Pattern = re.compile(r'\b[A-Z0-9]{1,10}-[A-Z0-9]{1,10}-[A-Z0-9]{1,10}\b', re.IGNORECASE)

# 6. Financial Card Numbers & Contextual CVV
CARD_NUMBER_PATTERN: Pattern = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
# Contextual CVV: requires keywords like CVV, CVC, CID, Security Code within close proximity
CARD_CVV_PATTERN: Pattern = re.compile(r'(?:\b(?:cvv|cvc|cvv2|cvn|security\s*code|cid|card\s*code)\b[\s:#=-]*)\b(\d{3,4})\b', re.IGNORECASE)

# 7. Phone Numbers & Coordinates
PHONE_PATTERN: Pattern = re.compile(r'\(?\+?\d{1,4}\)?[\s-]?\d{7,14}\b')
COORDINATES_PATTERN: Pattern = re.compile(r'\b(-?\d+(?:\.\d+)?)°\s*([NnSs])\s*,\s*(-?\d+(?:\.\d+)?)°\s*([EeWw])\b')

# 8. Dates of Birth & Dates
DOB_PATTERN: Pattern = re.compile(r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b')

# 9. Orders, Invoices & Money
INVOICE_ORDER_PATTERN: Pattern = re.compile(r'\b(?:#?INV|#?ORD|#?TXN|#?BILL|#?REF|#?PO|#?TRK|#?ORDER|#?INVOICE|#?TRACKING)[\s#:-]*[A-Z0-9]{3,18}\b', re.IGNORECASE)
MONEY_PATTERN: Pattern = re.compile(r'(?:[\$€£₹]|Rs\.?|INR|USD|EUR|GBP)\s*\d+(?:[\.,]\d+)*(?:\s*(?:lakh|crore|million|billion|thousand|k|M|B))?|\b\d+(?:[\.,]\d+)*\s*(?:Rs\.?|INR|dollars|euros|pounds|lakhs|crores)\b', re.IGNORECASE)

# 10. Postal Codes / ZIP Codes (5 digits or 5-4 digits, avoiding matching common 5-digit word counts)
POSTAL_CODE_PATTERN: Pattern = re.compile(r'\b(?:zip|postal|pin|code)[\s:#=-]*(\d{5,6}(?:-\d{4})?)\b|\b\d{5}-\d{4}\b', re.IGNORECASE)

# 11. Contextual Bank Account Numbers (prevents matching random 9-18 digit numbers)
BANK_ACCOUNT_PATTERN: Pattern = re.compile(r'(?:\b(?:a/c|account|acct|iban|ifsc|bank|acc)\b[\s:#=-]*)\b(\d{9,18})\b|\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b', re.IGNORECASE)

# Ordered list of patterns for Level 1 redaction execution
ORDERED_PATTERNS: List[Pattern] = [
    URL_PATTERN,
    EMAIL_PATTERN,
    BITCOIN_ADDRESS_PATTERN,
    CRYPTO_KEY_PATTERN,
    HEX_PATTERN,
    IP_ADDRESS_PATTERN,
    MAC_ADDRESS_PATTERN,
    AADHAAR_PATTERN,
    PAN_PATTERN,
    TAN_PATTERN,
    SSN_PATTERN,
    PASSPORT_PATTERN,
    DRIVER_LICENSE_PATTERN,
    CARD_NUMBER_PATTERN,
    CARD_CVV_PATTERN,
    PHONE_PATTERN,
    COORDINATES_PATTERN,
    DOB_PATTERN,
    INVOICE_ORDER_PATTERN,
    MONEY_PATTERN,
    POSTAL_CODE_PATTERN,
    BANK_ACCOUNT_PATTERN,
]

def _redact_match(match: re.Match) -> str:
    """
    Helper function to replace matched text with 'x' of identical length.
    If regex has capturing groups (like contextual CVV or Bank Account), only replace the capturing group.
    """
    if match.groups() and match.group(1):
        full_text = match.group(0)
        group_text = match.group(1)
        return full_text.replace(group_text, 'x' * len(group_text), 1)
    return 'x' * len(match.group(0))

def redact_all(text: str) -> str:
    """
    Apply pre-compiled regex patterns in strict order of specificity to redact structured PII.
    """
    if not text or not isinstance(text, str):
        return text
    
    redacted_text = text
    for pattern in ORDERED_PATTERNS:
        redacted_text = pattern.sub(_redact_match, redacted_text)
        
    return redacted_text
