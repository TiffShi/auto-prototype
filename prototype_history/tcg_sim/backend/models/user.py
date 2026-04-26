from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    decks: Mapped[list["Deck"]] = relationship("Deck", back_populates="owner", cascade="all, delete-orphan")
    rooms_as_p1: Mapped[list["GameRoom"]] = relationship("GameRoom", foreign_keys="GameRoom.player1_id", back_populates="player1")
    rooms_as_p2: Mapped[list["GameRoom"]] = relationship("GameRoom", foreign_keys="GameRoom.player2_id", back_populates="player2")