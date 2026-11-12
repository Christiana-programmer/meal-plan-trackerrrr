from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    validate_jwt_secret,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserRead

router = APIRouter()


def require_auth_configuration() -> None:
    try:
        validate_jwt_secret()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    require_auth_configuration()
    email = str(payload.email).strip().lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from error

    return AuthResponse(
        user=UserRead.model_validate(user),
        access_token=create_access_token(user.id),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    require_auth_configuration()
    email = str(payload.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthResponse(
        user=UserRead.model_validate(user),
        access_token=create_access_token(user.id),
    )


@router.get("/me", response_model=UserRead)
def get_me(user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(user)
