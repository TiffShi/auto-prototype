from sqlalchemy import Integer, String, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
import enum


class CardType(str, enum.Enum):
    creature = "creature"
    spell = "spell"


class CardRarity(str, enum.Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    legendary = "legendary"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    attack: Mapped[int] = mapped_column(Integer, default=0)
    defense: Mapped[int] = mapped_column(Integer, default=0)
    cost: Mapped[int] = mapped_column(Integer, default=1)
    type: Mapped[CardType] = mapped_column(Enum(CardType), nullable=False)
    effect_text: Mapped[str] = mapped_column(Text, default="")
    image_key: Mapped[str] = mapped_column(String(255), default="")
    rarity: Mapped[CardRarity] = mapped_column(Enum(CardRarity), default=CardRarity.common)

    deck_cards: Mapped[list["DeckCard"]] = relationship("DeckCard", back_populates="card")