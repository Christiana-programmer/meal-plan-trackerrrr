from datetime import date, timedelta
from math import floor
from zoneinfo import ZoneInfo

from app.models.budget import Budget
from app.schemas.dashboard import DashboardSummary, DashboardWarning
from app.schemas.expense import ExpenseRead

LAGOS_TIMEZONE = ZoneInfo("Africa/Lagos")


def get_lagos_today() -> date:
    from datetime import datetime

    return datetime.now(LAGOS_TIMEZONE).date()


def round_kobo(value: float) -> int:
    return floor(value + 0.5)


def get_budget_status(
    budget: Budget,
    remaining_balance_kobo: int,
    today: date,
) -> str:
    if budget.start_date > today:
        return "upcoming"
    if today > budget.end_date:
        return "completed"
    if remaining_balance_kobo == 0:
        return "exhausted"
    return "active"


def get_dashboard_summary(
    budget: Budget | None,
    expenses: list[ExpenseRead],
    today: date,
) -> DashboardSummary:
    if budget is None:
        return DashboardSummary(
            totalCreditsKobo=0,
            totalSpentKobo=0,
            remainingBalanceKobo=0,
            remainingDays=0,
            daysUntilStart=0,
            dailyAllowanceKobo=0,
            progressPercent=0,
            status="completed",
        )

    total_spent = sum(expense.amount_kobo for expense in expenses)
    remaining = max(0, budget.total_credits_kobo - total_spent)
    status = get_budget_status(budget, remaining, today)
    remaining_days = (
        max(0, (budget.end_date - today).days + 1)
        if status in {"active", "exhausted"}
        else 0
    )
    days_until_start = (
        (budget.start_date - today).days if status == "upcoming" else 0
    )
    if status == "upcoming":
        daily_allowance = round_kobo(
            budget.total_credits_kobo / budget.duration_days
        )
    elif status == "active" and remaining_days > 0:
        daily_allowance = round_kobo(remaining / remaining_days)
    else:
        daily_allowance = 0

    return DashboardSummary(
        totalCreditsKobo=budget.total_credits_kobo,
        totalSpentKobo=total_spent,
        remainingBalanceKobo=remaining,
        remainingDays=remaining_days,
        daysUntilStart=days_until_start,
        dailyAllowanceKobo=daily_allowance,
        progressPercent=(
            min(100, total_spent / budget.total_credits_kobo * 100)
            if budget.total_credits_kobo > 0
            else 0
        ),
        status=status,
    )


def get_dashboard_warnings(
    budget: Budget | None,
    summary: DashboardSummary,
    expenses: list[ExpenseRead],
    today: date,
) -> list[DashboardWarning]:
    if budget is None:
        return []
    if summary.status == "exhausted":
        return [
            DashboardWarning(
                level="critical",
                title="Meal credit exhausted",
                message=(
                    "There’s no balance left for this period. Add your next "
                    "meal credit to start a new budget period."
                ),
            )
        ]
    if summary.status == "completed":
        return [
            DashboardWarning(
                level="warning",
                title="This budget period has ended",
                message=(
                    "Review your remaining balance and add your next meal "
                    "credit when you receive it."
                ),
            )
        ]
    if summary.status != "active":
        return []

    warnings: list[DashboardWarning] = []
    spent_percent = (
        summary.total_spent_kobo / budget.total_credits_kobo
        if budget.total_credits_kobo > 0
        else 0
    )
    if spent_percent >= 0.8:
        warnings.append(
            DashboardWarning(
                level="warning",
                title="Your meal credit is running low",
                message=(
                    f"You’ve used {round_kobo(spent_percent * 100)}% of this "
                    f"period’s credit. Your remaining balance is "
                    f"₦{summary.remaining_balance_kobo / 100:,.2f}."
                ),
            )
        )

    spent_before_today = sum(
        expense.amount_kobo
        for expense in expenses
        if expense.transaction_date < today
    )
    spent_today = sum(
        expense.amount_kobo
        for expense in expenses
        if expense.transaction_date == today
    )
    start_of_day_balance = max(
        0, budget.total_credits_kobo - spent_before_today
    )
    start_of_day_guide = (
        round_kobo(start_of_day_balance / summary.remaining_days)
        if summary.remaining_days > 0
        else 0
    )
    exceeded_daily_guide = spent_today > start_of_day_guide
    if exceeded_daily_guide:
        warnings.append(
            DashboardWarning(
                level="warning",
                title="Today’s spending is above your daily guide",
                message=(
                    f"You’ve recorded ₦{spent_today / 100:,.2f} today. "
                    f"Your suggested amount at the start of the day was "
                    f"₦{start_of_day_guide / 100:,.2f}. You can spend more, "
                    "but it leaves less to spread across the remaining days."
                ),
            )
        )

    elapsed_days = min(
        budget.duration_days,
        budget.duration_days - summary.remaining_days + 1,
    )
    expected_spent = round_kobo(
        budget.total_credits_kobo * elapsed_days / budget.duration_days
    )
    spending_ahead = summary.total_spent_kobo - expected_spent
    warning_threshold = max(
        50_000, round_kobo(budget.total_credits_kobo * 0.1)
    )
    if spending_ahead > warning_threshold and not exceeded_daily_guide:
        warnings.append(
            DashboardWarning(
                level="warning",
                title="Spending is ahead of your plan",
                message=(
                    f"You’ve spent ₦{spending_ahead / 100:,.2f} more than "
                    f"the expected pace for this point in the period. Your "
                    f"daily guide is ₦{summary.daily_allowance_kobo / 100:,.2f}."
                ),
            )
        )
    return warnings


def calculate_end_date(start_date: date, duration_days: int) -> date:
    return start_date + timedelta(days=duration_days - 1)
