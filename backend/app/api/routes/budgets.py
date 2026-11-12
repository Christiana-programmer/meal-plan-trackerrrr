from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.calculations import (
    calculate_end_date,
    get_budget_status,
    get_lagos_today,
)
from app.core.database import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetHistory, BudgetRead

router = APIRouter()


def get_current_budget(db: Session, user_id: UUID) -> Budget | None:
    return db.scalar(
        select(Budget)
        .where(Budget.user_id == user_id)
        .order_by(Budget.created_at.desc(), Budget.id.desc())
        .limit(1)
    )


@router.get("/current", response_model=BudgetRead | None)
def read_current_budget(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget | None:
    return get_current_budget(db, user.id)


@router.get("/history", response_model=BudgetHistory)
def read_budget_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BudgetHistory:
    budgets = list(
        db.scalars(
            select(Budget)
            .where(Budget.user_id == user.id)
            .order_by(Budget.created_at.desc(), Budget.id.desc())
        )
    )
    previous_ids = {budget.id for budget in budgets[1:]}
    expenses = (
        list(
            db.scalars(
                select(Expense)
                .where(
                    Expense.user_id == user.id,
                    Expense.budget_id.in_(previous_ids),
                )
                .order_by(Expense.transaction_date.desc(), Expense.created_at.desc())
            )
        )
        if previous_ids
        else []
    )
    return BudgetHistory(budgets=budgets[1:], expenses=expenses)


@router.post(
    "",
    response_model=BudgetRead,
    status_code=status.HTTP_201_CREATED,
)
def create_budget(
    payload: BudgetCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget:
    db.scalar(select(User).where(User.id == user.id).with_for_update())
    current = get_current_budget(db, user.id)
    today = get_lagos_today()
    if payload.start_date < today:
        raise HTTPException(
            status_code=422,
            detail="Budget start date cannot be in the past.",
        )

    if current is not None:
        spent = db.scalar(
            select(func.coalesce(func.sum(Expense.amount_kobo), 0)).where(
                Expense.user_id == user.id,
                Expense.budget_id == current.id,
            )
        )
        remaining = max(0, current.total_credits_kobo - int(spent or 0))
        current_status = get_budget_status(current, remaining, today)
        if current_status in {"active", "upcoming"}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Your current credit period is still open. Add a new "
                    "credit after it is exhausted or completed."
                ),
            )

    budget = Budget(
        user_id=user.id,
        total_credits_kobo=payload.total_credits_kobo,
        duration_days=payload.duration_days,
        start_date=payload.start_date,
        end_date=calculate_end_date(payload.start_date, payload.duration_days),
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget
