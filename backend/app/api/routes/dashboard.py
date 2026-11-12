from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.calculations import (
    get_dashboard_summary,
    get_dashboard_warnings,
    get_lagos_today,
)
from app.core.database import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.schemas.dashboard import DashboardRead
from app.schemas.expense import ExpenseRead

router = APIRouter()


@router.get("", response_model=DashboardRead)
def read_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardRead:
    budgets = list(
        db.scalars(
            select(Budget)
            .where(Budget.user_id == user.id)
            .order_by(Budget.created_at.desc(), Budget.id.desc())
        )
    )
    current_budget = budgets[0] if budgets else None
    previous_budgets = budgets[1:]
    current_expenses = (
        list(
            db.scalars(
                select(Expense)
                .where(
                    Expense.user_id == user.id,
                    Expense.budget_id == current_budget.id,
                )
                .order_by(
                    Expense.transaction_date.desc(), Expense.created_at.desc()
                )
            )
        )
        if current_budget
        else []
    )
    previous_ids = {budget.id for budget in previous_budgets}
    previous_expenses = (
        list(
            db.scalars(
                select(Expense)
                .where(
                    Expense.user_id == user.id,
                    Expense.budget_id.in_(previous_ids),
                )
                .order_by(
                    Expense.transaction_date.desc(), Expense.created_at.desc()
                )
            )
        )
        if previous_ids
        else []
    )
    current_expense_reads = [
        ExpenseRead.model_validate(expense) for expense in current_expenses
    ]
    today = get_lagos_today()
    summary = get_dashboard_summary(current_budget, current_expense_reads, today)

    return DashboardRead(
        budget=current_budget,
        previous_budgets=previous_budgets,
        previous_expenses=previous_expenses,
        recent_expenses=current_expense_reads[:5],
        summary=summary,
        warnings=get_dashboard_warnings(
            current_budget, summary, current_expense_reads, today
        ),
    )
