from fastapi import FastAPI, Request, status, File, UploadFile, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from io import BytesIO
import PyPDF2
import regex as reg


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
            redacted_text = reg.redact_all(request.text)
        elif request.redaction_level == 2:
            redacted_text = reg.redact_all(request.text)
        else:
            redacted_text = reg.redact_all(request.text)

        return {"redactedText": redacted_text}
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/redact-pdf/")
async def redact_pdf(file: UploadFile = File(...), redaction_level: int = 1):
    """
    API endpoint to redact text in a PDF file based on the redaction level.
    The redacted PDF is returned as a download.
    """
    try:
        # Read the uploaded PDF file
        pdf_data = await file.read()
       
        pdf_file = BytesIO(pdf_data)


        # Return the redacted PDF as a StreamingResponse
        return StreamingResponse(pdf_file, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=redacted_{file.filename}"})

    except Exception as e:
        return {"error": str(e)}
    
@app.post("/redact-file/")
async def redact_file(file: UploadFile = File(...), redaction_level: int =1):
    try:
        if not file.content_type.startswith("text/"):
            raise HTTPException(status_code=400, detail="Only text files are allowed.")
        file_data = await file.read()
        file_stream = BytesIO(file_data)

        return StreamingResponse(file_stream, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=redacted_{file.filename}"})
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/redact-image/")
async def redact_image(file: UploadFile = File(...)):
    try:
        # Check if the file is a supported image type (jpg, jpeg, png)
        allowed_image_types = ["image/jpeg", "image/png"]
        if file.content_type not in allowed_image_types:
            raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, and .png image files are allowed.")
        
        # Read the uploaded image file
        image_data = await file.read()

        # Create a BytesIO stream from the image data
        image_stream = BytesIO(image_data)

        # Return the image as a StreamingResponse
        return StreamingResponse(image_stream, media_type=file.content_type, 
                                 headers={"Content-Disposition": f"attachment; filename={file.filename}"})
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/redact-video/")
async def redact_video(file: UploadFile = File(...)):
    try:
        # Check if the file is a supported video type (mp4)
        if file.content_type != "video/mp4":
            raise HTTPException(status_code=400, detail="Only .mp4 video files are allowed.")
        
        # Read the uploaded video file
        video_data = await file.read()

        # Create a BytesIO stream from the video data
        video_stream = BytesIO(video_data)

        # Return the video as a StreamingResponse
        return StreamingResponse(video_stream, media_type="video/mp4", 
                                 headers={"Content-Disposition": f"attachment; filename={file.filename}"})
    except Exception as e:
        return {"error": str(e)}

    
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
	exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
	logging.error(f"{request}: {exc_str}")
	content = {'status_code': 10422, 'message': exc_str, 'data': None}
	return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

