from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()


def validate_jwt_secret() -> str:
    secret = get_settings().jwt_secret_key
    if len(secret) < 32:
        raise RuntimeError(
            "JWT_SECRET_KEY must be configured with at least 32 characters."
        )
    return secret


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: UUID) -> str:
    settings = get_settings()
    secret = validate_jwt_secret()

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        secret,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> UUID:
    secret = validate_jwt_secret()
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise jwt.InvalidTokenError("Token subject is invalid.")
    return UUID(subject)
