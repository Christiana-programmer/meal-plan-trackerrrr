from typing import Literal

from app.schemas.base import ApiSchema
from app.schemas.budget import BudgetRead
from app.schemas.expense import ExpenseRead

BudgetStatus = Literal["upcoming", "active", "exhausted", "completed"]
WarningLevel = Literal["warning", "critical"]


class DashboardSummary(ApiSchema):
    total_credits_kobo: int
    total_spent_kobo: int
    remaining_balance_kobo: int
    remaining_days: int
    days_until_start: int
    daily_allowance_kobo: int
    progress_percent: float
    status: BudgetStatus


class DashboardWarning(ApiSchema):
    level: WarningLevel
    title: str
    message: str


class DashboardRead(ApiSchema):
    budget: BudgetRead | None
    previous_budgets: list[BudgetRead]
    previous_expenses: list[ExpenseRead]
    recent_expenses: list[ExpenseRead]
    summary: DashboardSummary
    warnings: list[DashboardWarning]
