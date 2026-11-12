from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.models.base import Base


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        CheckConstraint("total_credits_kobo > 0", name="positive_total_credits"),
        CheckConstraint("duration_days > 0", name="positive_duration_days"),
        CheckConstraint("end_date >= start_date", name="valid_date_range"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    total_credits_kobo: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="budgets")
    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="budget", cascade="all, delete-orphan"
    )
