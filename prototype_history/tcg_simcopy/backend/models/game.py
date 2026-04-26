from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
import enum


class RoomStatus(str, enum.Enum):
    waiting = "waiting"
    active = "active"
    finished = "finished"


class GameRoom(Base):
    __tablename__ = "game_rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_code: Mapped[str] = mapped_column(String(8), unique=True, nullable=False, index=True)
    player1_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    player2_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    player1_deck_id: Mapped[int] = mapped_column(Integer, ForeignKey("decks.id"), nullable=True)
    player2_deck_id: Mapped[int] = mapped_column(Integer, ForeignKey("decks.id"), nullable=True)
    status: Mapped[RoomStatus] = mapped_column(Enum(RoomStatus), default=RoomStatus.waiting)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    player1: Mapped["User"] = relationship("User", foreign_keys=[player1_id], back_populates="rooms_as_p1")
    player2: Mapped["User"] = relationship("User", foreign_keys=[player2_id], back_populates="rooms_as_p2")
    history: Mapped[list["GameHistory"]] = relationship("GameHistory", back_populates="room")


class GameHistory(Base):
    __tablename__ = "game_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("game_rooms.id"), nullable=False)
    winner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    turns_played: Mapped[int] = mapped_column(Integer, default=0)
    ended_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    room: Mapped["GameRoom"] = relationship("GameRoom", back_populates="history")