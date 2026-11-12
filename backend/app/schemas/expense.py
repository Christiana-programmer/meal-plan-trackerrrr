from datetime import date, datetime
from uuid import UUID

from pydantic import Field, StringConstraints
from typing import Annotated

from app.schemas.base import ApiSchema

ExpenseDescription = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]


class ExpenseWrite(ApiSchema):
    amount_kobo: int = Field(strict=True, gt=0, le=2_000_000_000)
    description: ExpenseDescription
    transaction_date: date


class ExpenseRead(ApiSchema):
    id: UUID
    user_id: UUID
    budget_id: UUID
    amount_kobo: int
    description: str
    transaction_date: date
    created_at: datetime
    updated_at: datetime
