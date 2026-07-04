import os
import datetime
import logging
import base64
import bcrypt
import jwt
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, Dict, Any

from app.models import UserRegister, Token
from app.database import execute_query, fetch_one, fetch_all

router = APIRouter(tags=["auth"])

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "redactx_super_secret_jwt_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, stored_password: str) -> bool:
    try:
        if stored_password.startswith("$2b$") or stored_password.startswith("$2a$") or stored_password.startswith("$2y$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), stored_password.encode("utf-8"))
        else:
            # Fallback comparison for plaintext passwords legacy schema migration
            return plain_password == stored_password
    except Exception as e:
        logging.error(f"Password verification error: {e}")
        return False

async def get_optional_user(request: Request, token: Optional[str] = Depends(oauth2_scheme)) -> Optional[Dict[str, Any]]:
    auth_header = request.headers.get("authorization")
    if not token and auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header[7:].strip()
    
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            user = await fetch_one("SELECT id, username, first_name, last_name FROM users WHERE id = ?", (user_id,))
            return user
    except Exception:
        pass
    return None

async def get_current_user(user: Optional[Dict[str, Any]] = Depends(get_optional_user)) -> Dict[str, Any]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/submit-form", status_code=status.HTTP_201_CREATED)
async def submit_form(user: UserRegister):
    hashed_pwd = hash_password(user.password)
    try:
        # We store hashed password and drop confirm_password
        await execute_query('''
            INSERT INTO users (first_name, last_name, username, password, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user.first_name,
            user.last_name,
            user.username,
            hashed_pwd,
            user.security_question or "None",
            user.security_answer or "None",
        ))
        return {"message": "User registered securely."}
    except Exception as e:
        if "UNIQUE constraint failed" in str(e) or "users.username" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(request: Request):
    """
    Unified login supporting JSON payload ({username, password}), OAuth2 Form, or HTTP Basic Auth.
    Returns JWT bearer token.
    """
    username = ""
    password = ""
    
    content_type = request.headers.get("content-type", "").lower()
    if "application/json" in content_type:
        try:
            data = await request.json()
            username = str(data.get("username", "")).strip()
            password = str(data.get("password", ""))
        except Exception:
            pass
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            username = str(form.get("username", "")).strip()
            password = str(form.get("password", ""))
        except Exception:
            pass
            
    if not username:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Basic "):
            try:
                decoded = base64.b64decode(auth_header[6:]).decode("utf-8")
                if ":" in decoded:
                    username, password = decoded.split(":", 1)
            except Exception:
                pass

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password must be provided.")

    user = await fetch_one("SELECT id, username, password FROM users WHERE username = ?", (username,))
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue JWT Token
    access_token = create_access_token({"sub": str(user["id"]), "username": user["username"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful"
    }

@router.get("/users", status_code=status.HTTP_200_OK)
async def get_users(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Protected endpoint to list registered users.
    """
    users = await fetch_all("SELECT id, first_name, last_name, username, security_question FROM users")
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")
    return [dict(u) for u in users]
