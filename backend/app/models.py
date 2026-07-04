from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class UserRegister(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)
    security_question: Optional[str] = Field(default="None")
    security_answer: Optional[str] = Field(default="None")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, confirm_password, info):
        if "password" in info.data and confirm_password != info.data["password"]:
            raise ValueError("Passwords do not match")
        return confirm_password

class UserLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str = "Login successful"

class RedactRequest(BaseModel):
    # Max length set to 100,000 characters (~100KB) to prevent DoS attacks
    text: str = Field(..., max_length=100000)
    redaction_level: int = Field(default=0, ge=0, le=5)
    mode: Optional[str] = Field(default="mask")

class FeedbackRequest(BaseModel):
    text: str = Field(..., max_length=100000)
    redacted_text: Optional[str] = ""
    satisfaction: str = Field(..., pattern="^(yes|no)$")
    missed_entities: Optional[List[str]] = []
    corrected_text: Optional[str] = ""
    redaction_level: Optional[int] = 0

class HistoryItem(BaseModel):
    id: int
    filename: str
    operation_type: str
    redaction_level: int
    status: str
    timestamp: str
    details: Optional[str] = ""
