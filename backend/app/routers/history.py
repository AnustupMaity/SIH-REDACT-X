from fastapi import APIRouter, Depends, status
from typing import Dict, Any, List, Optional
from app.database import fetch_all
from app.routers.auth import get_optional_user

router = APIRouter(tags=["history"])

@router.get("/history", status_code=status.HTTP_200_OK)
async def get_history(user: Optional[Dict[str, Any]] = Depends(get_optional_user)) -> List[Dict[str, Any]]:
    """
    Returns the last 25 redaction operations recorded in the database.
    If authenticated, returns user-specific operations along with general operations.
    """
    if user:
        user_id = user["id"]
        rows = await fetch_all(
            "SELECT id, filename, operation_type, redaction_level, status, timestamp, details FROM history WHERE user_id = ? OR user_id = 0 ORDER BY id DESC LIMIT 25",
            (user_id,)
        )
    else:
        rows = await fetch_all(
            "SELECT id, filename, operation_type, redaction_level, status, timestamp, details FROM history ORDER BY id DESC LIMIT 25"
        )
    return [dict(r) for r in rows]
