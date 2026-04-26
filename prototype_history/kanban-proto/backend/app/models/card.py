import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("columns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="priority_enum"), nullable=False, default=Priority.medium
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    column: Mapped["Column"] = relationship("Column", back_populates="cards")