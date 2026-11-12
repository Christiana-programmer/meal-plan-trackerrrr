from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.routes.budgets import get_current_budget
from app.core.calculations import get_lagos_today
from app.core.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseRead, ExpenseWrite

router = APIRouter()


def lock_user(db: Session, user_id: UUID) -> None:
    db.scalar(select(User).where(User.id == user_id).with_for_update())


def validate_transaction_date(
    transaction_date: date,
    start_date: date,
    end_date: date,
) -> None:
    if (
        transaction_date < start_date
        or transaction_date > end_date
        or transaction_date > get_lagos_today()
    ):
        raise HTTPException(
            status_code=422,
            detail="Choose a date within your budget period, up to today.",
        )


def get_expense_balance(
    db: Session,
    user_id: UUID,
    budget_id: UUID,
    exclude_expense_id: UUID | None = None,
) -> int:
    query = select(func.coalesce(func.sum(Expense.amount_kobo), 0)).where(
        Expense.user_id == user_id,
        Expense.budget_id == budget_id,
    )
    if exclude_expense_id is not None:
        query = query.where(Expense.id != exclude_expense_id)
    return int(db.scalar(query) or 0)


def validate_expense_amount(amount_kobo: int, available_kobo: int) -> None:
    if amount_kobo > available_kobo:
        raise HTTPException(
            status_code=422,
            detail="This expense is more than your remaining meal balance.",
        )


@router.get("", response_model=list[ExpenseRead])
def list_expenses(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Expense]:
    budget = get_current_budget(db, user.id)
    if budget is None:
        return []
    return list(
        db.scalars(
            select(Expense)
            .where(Expense.user_id == user.id, Expense.budget_id == budget.id)
            .order_by(Expense.transaction_date.desc(), Expense.created_at.desc())
        )
    )


@router.post(
    "",
    response_model=ExpenseRead,
    status_code=status.HTTP_201_CREATED,
)
def create_expense(
    payload: ExpenseWrite,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Expense:
    lock_user(db, user.id)
    budget = get_current_budget(db, user.id)
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Create a meal budget before recording an expense.",
        )
    validate_transaction_date(
        payload.transaction_date, budget.start_date, budget.end_date
    )
    spent = get_expense_balance(db, user.id, budget.id)
    available = max(0, budget.total_credits_kobo - spent)
    validate_expense_amount(payload.amount_kobo, available)

    expense = Expense(
        user_id=user.id,
        budget_id=budget.id,
        amount_kobo=payload.amount_kobo,
        description=payload.description,
        transaction_date=payload.transaction_date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(
    expense_id: UUID,
    payload: ExpenseWrite,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Expense:
    lock_user(db, user.id)
    budget = get_current_budget(db, user.id)
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That expense could not be found.",
        )
    expense = db.scalar(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == user.id,
            Expense.budget_id == budget.id,
        )
    )
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That expense could not be found.",
        )

    validate_transaction_date(
        payload.transaction_date, budget.start_date, budget.end_date
    )
    other_spent = get_expense_balance(
        db, user.id, budget.id, exclude_expense_id=expense.id
    )
    available = max(0, budget.total_credits_kobo - other_spent)
    validate_expense_amount(payload.amount_kobo, available)

    expense.amount_kobo = payload.amount_kobo
    expense.description = payload.description
    expense.transaction_date = payload.transaction_date
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    lock_user(db, user.id)
    budget = get_current_budget(db, user.id)
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That expense could not be found.",
        )
    expense = db.scalar(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == user.id,
            Expense.budget_id == budget.id,
        )
    )
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That expense could not be found.",
        )
    db.delete(expense)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
