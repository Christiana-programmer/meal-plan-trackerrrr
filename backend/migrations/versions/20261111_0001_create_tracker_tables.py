"""Create user, budget, and expense tables.

Revision ID: 20261111_0001
Revises:
Create Date: 2026-11-11
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261111_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "budgets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("total_credits_kobo", sa.Integer(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "duration_days > 0",
            name=op.f("ck_budgets_positive_duration_days"),
        ),
        sa.CheckConstraint(
            "end_date >= start_date",
            name=op.f("ck_budgets_valid_date_range"),
        ),
        sa.CheckConstraint(
            "total_credits_kobo > 0",
            name=op.f("ck_budgets_positive_total_credits"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_budgets_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_budgets")),
    )
    op.create_index(op.f("ix_budgets_user_id"), "budgets", ["user_id"])

    op.create_table(
        "expenses",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("budget_id", sa.Uuid(), nullable=False),
        sa.Column("amount_kobo", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=120), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "amount_kobo > 0",
            name=op.f("ck_expenses_positive_amount"),
        ),
        sa.ForeignKeyConstraint(
            ["budget_id"],
            ["budgets.id"],
            name=op.f("fk_expenses_budget_id_budgets"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_expenses_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_expenses")),
    )
    op.create_index(op.f("ix_expenses_budget_id"), "expenses", ["budget_id"])
    op.create_index(op.f("ix_expenses_user_id"), "expenses", ["user_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_expenses_user_id"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_budget_id"), table_name="expenses")
    op.drop_table("expenses")
    op.drop_index(op.f("ix_budgets_user_id"), table_name="budgets")
    op.drop_table("budgets")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
