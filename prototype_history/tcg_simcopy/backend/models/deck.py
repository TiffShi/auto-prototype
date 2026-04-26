from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner: Mapped["User"] = relationship("User", back_populates="decks")
    deck_cards: Mapped[list["DeckCard"]] = relationship(
        "DeckCard", back_populates="deck", cascade="all, delete-orphan"
    )


class DeckCard(Base):
    __tablename__ = "deck_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    deck_id: Mapped[int] = mapped_column(Integer, ForeignKey("decks.id"), nullable=False)
    card_id: Mapped[int] = mapped_column(Integer, ForeignKey("cards.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    __table_args__ = (UniqueConstraint("deck_id", "card_id", name="uq_deck_card"),)

    deck: Mapped["Deck"] = relationship("Deck", back_populates="deck_cards")
    card: Mapped["Card"] = relationship("Card", back_populates="deck_cards")