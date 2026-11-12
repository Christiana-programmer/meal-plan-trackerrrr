from typing import Annotated
from uuid import UUID

from pydantic import EmailStr, StringConstraints

from app.schemas.base import ApiSchema

Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]


class RegisterRequest(ApiSchema):
    full_name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)
    ]
    email: EmailStr
    password: Password


class LoginRequest(ApiSchema):
    email: EmailStr
    password: Password


class UserRead(ApiSchema):
    id: UUID
    full_name: str
    email: EmailStr


class AuthResponse(ApiSchema):
    user: UserRead
    access_token: str
    token_type: str = "bearer"
