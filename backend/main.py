"""
RedactX Entry Point Wrapper.
Re-exports the FastAPI application from the modularized app package
to preserve compatibility with existing uvicorn execution scripts.
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
