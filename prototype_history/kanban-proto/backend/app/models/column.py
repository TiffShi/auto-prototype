import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Column(Base):
    __tablename__ = "columns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    board: Mapped["Board"] = relationship("Board", back_populates="columns")
    cards: Mapped[list["Card"]] = relationship(
        "Card", back_populates="column", cascade="all, delete-orphan"
    )