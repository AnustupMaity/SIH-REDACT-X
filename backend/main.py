from fastapi import FastAPI, Request, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

class RedactRequest(BaseModel):
    text: str
    redaction_level: int

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/redact")
async def redact_text(request: RedactRequest):
    print(request)
    """
    API endpoint to redact text based on redaction level.
    """
    try:
        redacted_text = request.text
        if request.redaction_level == 1:
            redacted_text = ''.join('*' if c in 'aeiouAEIOU' else c for c in redacted_text)
        elif request.redaction_level == 2:
            redacted_text = ''.join('*' if c.isalpha() else c for c in redacted_text)
        else:
            redacted_text = "Soumi r Dhritishree r gar mara hobe"

        return {"redactedText": redacted_text}
    except Exception as e:
        return {"error": str(e)}
    
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
	exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
	logging.error(f"{request}: {exc_str}")
	content = {'status_code': 10422, 'message': exc_str, 'data': None}
	return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

