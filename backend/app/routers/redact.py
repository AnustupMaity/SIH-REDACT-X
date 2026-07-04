import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends, status
from typing import Optional, Dict, Any

from app.models import RedactRequest
from app.services.redaction import redact_by_level
from app.services.file_handlers import (
    handle_pdf, handle_image, handle_xlsx, handle_txt,
    handle_docx, handle_pptx, handle_csv, handle_log, record_history
)
from app.routers.auth import get_optional_user

router = APIRouter(tags=["redact"])

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB limit

@router.post("/redact")
async def redact_text_endpoint(request: RedactRequest, user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    """
    API endpoint to redact sensitive information using regex, spaCy, and Transformer methods.
    Supports levels 0 to 5 with additive redaction layering.
    """
    user_id = user["id"] if user else None
    try:
        if request.redaction_level == 0:
            await record_history(user_id, "Text Input", "Text Redaction", 0, "SUCCESS")
            return {"redacted_text": request.text}

        fully_redacted_text = redact_by_level(request.text, request.redaction_level, mode=request.mode or "mask")
        await record_history(user_id, "Text Input", "Text Redaction", request.redaction_level, "SUCCESS")
        return {"redacted_text": fully_redacted_text}
    except Exception as e:
        await record_history(user_id, "Text Input", "Text Redaction", request.redaction_level, "FAILED", str(e))
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/redact-pdf/")
async def redact_file_endpoint(
    file: UploadFile = File(...),
    redaction_level: int = Form(...),
    mode: str = Form(default="mask"),
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Multi-format redaction endpoint with file size validation (max 50MB).
    Supports PDF, TXT, DOCX, PPTX, CSV, XLSX, LOG, JPG, PNG.
    """
    user_id = user["id"] if user else None
    try:
        content_type = file.content_type
        valid_types = [
           "application/pdf",
           "text/plain",
           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
           "application/vnd.openxmlformats-officedocument.presentationml.presentation",
           "application/octet-stream",
           "text/csv",
           "image/jpeg",
           "image/png",
           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
           "application/vnd.ms-excel"
        ]
        valid_extensions = (".pdf", ".txt", ".docx", ".pptx", ".csv", ".log", ".jpg", ".jpeg", ".png", ".xlsx", ".xls")

        if content_type not in valid_types and not (file.filename and file.filename.lower().endswith(valid_extensions)):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a PDF, TXT, DOCX, PPTX, CSV, XLSX, LOG, JPG, or PNG file."
            )

        file_data = await file.read()
        if len(file_data) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds maximum allowed upload size of 50MB."
            )

        lower_name = (file.filename or "document").lower()

        if content_type == "application/pdf" or lower_name.endswith(".pdf"):
            return await handle_pdf(file_data, file.filename or "doc.pdf", redaction_level, user_id)
        elif content_type in ["image/jpeg", "image/png"] or lower_name.endswith((".jpg", ".jpeg", ".png")):
            return await handle_image(file_data, file.filename or "img.png", redaction_level, user_id)
        elif content_type in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"] or lower_name.endswith((".xlsx", ".xls")):
            return await handle_xlsx(file_data, file.filename or "sheet.xlsx", redaction_level, user_id)
        elif content_type == "text/plain" or lower_name.endswith(".txt"):
            return await handle_txt(file_data, file.filename or "text.txt", redaction_level, user_id)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or lower_name.endswith(".docx"):
            return await handle_docx(file_data, file.filename or "doc.docx", redaction_level, user_id)
        elif content_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation" or lower_name.endswith(".pptx"):
            return await handle_pptx(file_data, file.filename or "pres.pptx", redaction_level, user_id)
        elif content_type == "text/csv" or lower_name.endswith(".csv"):
            return await handle_csv(file_data, file.filename or "data.csv", redaction_level, user_id)
        elif content_type == "application/octet-stream" or lower_name.endswith(".log"):
            return await handle_log(file_data, file.filename or "app.log", redaction_level, user_id)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        logging.error(f"Unexpected error during file redaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
