from datetime import date, datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import ApiSchema
from app.schemas.expense import ExpenseRead


class BudgetCreate(ApiSchema):
    total_credits_kobo: int = Field(strict=True, gt=0, le=2_000_000_000)
    duration_days: int = Field(strict=True, gt=0, le=3650)
    start_date: date


class BudgetRead(ApiSchema):
    id: UUID
    user_id: UUID
    total_credits_kobo: int
    duration_days: int
    start_date: date
    end_date: date
    created_at: datetime


class BudgetHistory(ApiSchema):
    budgets: list[BudgetRead]
    expenses: list[ExpenseRead]
