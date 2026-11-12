import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except (SQLAlchemyError, RuntimeError) as error:
        logger.warning("Database readiness check failed: %s", error)
        raise HTTPException(
            status_code=503,
            detail="Database is not ready. Check DATABASE_URL and the Neon connection.",
        ) from error
    return {"status": "ready", "database": "connected"}
