import time
import psutil
from fastapi import APIRouter
from app.services.ner_engine import _spacy_models_cache, _transformer_pipeline, _transformer_model_name

router = APIRouter(tags=["health"])

START_TIME = time.time()
REQUEST_COUNTS = {"total": 0, "errors": 0}
PROCESSING_TIMES = {}

@router.get("/health")
async def health_check():
    """
    Health check endpoint reporting system status, uptime, and NLP model readiness.
    """
    uptime = time.time() - START_TIME
    spacy_loaded = list(_spacy_models_cache.keys())
    transformer_loaded = _transformer_pipeline is not None
    
    return {
        "status": "healthy",
        "uptime_seconds": round(uptime, 2),
        "models": {
            "spacy_loaded_levels": spacy_loaded,
            "transformer_model": _transformer_model_name,
            "transformer_loaded": transformer_loaded
        }
    }

@router.get("/metrics")
async def get_metrics():
    """
    Metrics endpoint reporting system memory usage, request counts, and uptime.
    """
    uptime = time.time() - START_TIME
    memory_info = psutil.virtual_memory() if hasattr(psutil, 'virtual_memory') else None
    
    return {
        "uptime_seconds": round(uptime, 2),
        "request_counts": REQUEST_COUNTS,
        "processing_times_avg_ms": {k: round(sum(v)/len(v)*1000, 2) for k, v in PROCESSING_TIMES.items() if v},
        "memory_used_mb": round(psutil.Process().memory_info().rss / (1024 * 1024), 2) if hasattr(psutil, 'Process') else "N/A"
    }
