from functools import lru_cache
from typing import Generator

from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def get_database_url() -> str:
    url = get_settings().database_url.strip()
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it in backend/.env."
        )
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


@lru_cache
def get_engine() -> Engine:
    return create_engine(get_database_url(), pool_pre_ping=True)


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    try:
        session_factory = get_session_factory()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
    with session_factory() as session:
        yield session
