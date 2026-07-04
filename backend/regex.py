"""
Legacy wrapper for regex redaction functions.
Redirects to pre-compiled ordered rules in app.services.regex_engine.
"""
from app.services.regex_engine import redact_all, ORDERED_PATTERNS
