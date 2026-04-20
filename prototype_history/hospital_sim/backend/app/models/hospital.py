import uuid
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=500000.0)
    day: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    speed_multiplier: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    is_paused: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    departments: Mapped[list["Department"]] = relationship(
        "Department", back_populates="hospital", cascade="all, delete-orphan"
    )
    patients: Mapped[list["Patient"]] = relationship(
        "Patient", back_populates="hospital", cascade="all, delete-orphan"
    )
    staff: Mapped[list["Staff"]] = relationship(
        "Staff", back_populates="hospital", cascade="all, delete-orphan"
    )
    inventory: Mapped[list["Inventory"]] = relationship(
        "Inventory", back_populates="hospital", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["FinancialTransaction"]] = relationship(
        "FinancialTransaction", back_populates="hospital", cascade="all, delete-orphan"
    )
    events: Mapped[list["Event"]] = relationship(
        "Event", back_populates="hospital", cascade="all, delete-orphan"
    )