from fastapi import FastAPI, Request, status, File, UploadFile, HTTPException
from pydantic import BaseModel, Field, validator
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from io import BytesIO
import sqlite3
from contextlib import asynccontextmanager
import logging
from fastapi.security import HTTPBasicCredentials
from ner import redact_entities  # Importing ner module
from regex import redact_all # Importing regex module

import bcrypt  # For securely comparing passwords (recommended)

DATABASE = "form_data.db"

# Initialize the database
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            confirm_password TEXT NOT NULL,
            security_question TEXT NOT NULL,
            security_answer TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Lifespan context manager for startup and cleanup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield  # The app runs between yield and the end of this block

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    security_question: str = Field(..., min_length=1)
    security_answer: str = Field(..., min_length=1)

    @validator("confirm_password")
    def passwords_match(cls, confirm_password, values):
        if "password" in values and confirm_password != values["password"]:
            raise ValueError("Passwords do not match")
        return confirm_password

class RedactRequest(BaseModel):
    text: str
    redaction_level: int

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Redact API"}

# User registration
@app.post("/submit-form", status_code=status.HTTP_201_CREATED)
async def submit_form(user: User):
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (first_name, last_name, username, password, confirm_password, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user.first_name,
            user.last_name,
            user.username,
            user.password,
            user.confirm_password,
            user.security_question,
            user.security_answer,
        ))
        conn.commit()
        conn.close()
        return {"message": "User data stored successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

# Get all users
@app.get("/users", status_code=status.HTTP_200_OK)
async def get_users():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, first_name, last_name, username, security_question FROM users")
    users = cursor.fetchall()
    conn.close()

    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")

    return [
        {
            "id": user[0],
            "first_name": user[1],
            "last_name": user[2],
            "username": user[3],
            "security_question": user[4],
        }
        for user in users
    ]



@app.post("/login", status_code=status.HTTP_200_OK)
async def login(credentials: HTTPBasicCredentials):
    """
    Endpoint to validate username and password for login.
    """
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE username = ?", (credentials.username,))
        result = cursor.fetchone()
        conn.close()

        if result:
            stored_password = result[0]
            # Compare plain-text passwords (not recommended for production)
            if credentials.password == stored_password:
                return {"message": "Login successful"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid password"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Username not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )


# Text redaction
@app.post("/redact")
async def redact_text(request: RedactRequest):
    """
    API endpoint to redact sensitive information using NER and regex-based methods.
    """
    print(request.text)
    try:
        
        # Redact entities using NER
        ner_redacted_text = redact_entities(request.text)
        print(ner_redacted_text)

        # Apply regex-based redaction to the text
        fully_redacted_text = redact_all(ner_redacted_text)
        print(fully_redacted_text)

        return {"redacted_text": fully_redacted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# File redaction (PDF)
@app.post("/redact-pdf/")
async def redact_pdf(file: UploadFile = File(...)):
    try:
        pdf_data = await file.read()
        pdf_file = BytesIO(pdf_data)
        return StreamingResponse(pdf_file, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=redacted_{file.filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# File redaction (Text)
@app.post("/redact-file/")
async def redact_file(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("text/"):
            raise HTTPException(status_code=400, detail="Only text files are allowed.")
        file_data = await file.read()
        file_stream = BytesIO(file_data)
        return StreamingResponse(file_stream, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=redacted_{file.filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )
