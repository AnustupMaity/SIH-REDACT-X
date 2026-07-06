import os
import time
import uuid
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.database import init_db
from app.routers import auth, redact, feedback, history, health
from app.services.ner_engine import get_spacy_model, preload_fallback_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("redactx")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RedactX API server...")
    # Initialize SQLite database asynchronously
    await init_db()
    
    # Pre-warm Level 1 spaCy model in memory to reduce cold-start latency
    try:
        logger.info("Pre-warming NLP models...")
        get_spacy_model(level=1)
        preload_fallback_model()
    except Exception as e:
        logger.warning(f"Model pre-warm warning: {e}")
        
    yield
    logger.info("Shutting down RedactX API server...")

app = FastAPI(title="RedactX API", version="2.0.0", lifespan=lifespan)

# Restrict CORS to development ports and configured production domains
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4433,http://127.0.0.1:5173,http://127.0.0.1:4433")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_request_timing_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    health.REQUEST_COUNTS["total"] = health.REQUEST_COUNTS.get("total", 0) + 1
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        logger.info(f"[{request_id}] {request.method} {request.url.path} -> {response.status_code} ({duration*1000:.2f}ms)")
        
        # Track processing times for metrics endpoint
        path_key = request.url.path
        if path_key not in health.PROCESSING_TIMES:
            health.PROCESSING_TIMES[path_key] = []
        health.PROCESSING_TIMES[path_key].append(duration)
        if len(health.PROCESSING_TIMES[path_key]) > 1000:
            health.PROCESSING_TIMES[path_key].pop(0)
            
        return response
    except Exception as e:
        health.REQUEST_COUNTS["errors"] = health.REQUEST_COUNTS.get("errors", 0) + 1
        duration = time.time() - start_time
        logger.error(f"[{request_id}] {request.method} {request.url.path} -> ERROR: {e} ({duration*1000:.2f}ms)")
        raise

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# Include modularized routers
app.include_router(auth.router)
app.include_router(redact.router)
app.include_router(feedback.router)
app.include_router(history.router)
app.include_router(health.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Redact API v2.0"}
