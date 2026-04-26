from datetime import datetime
from pydantic import BaseModel, field_validator
from schemas.card import CardOut


class DeckCardIn(BaseModel):
    card_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_range(cls, v: int) -> int:
        if v < 1 or v > 4:
            raise ValueError("Quantity must be between 1 and 4")
        return v


class DeckCreate(BaseModel):
    name: str
    cards: list[DeckCardIn]

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Deck name cannot be empty")
        return v


class DeckUpdate(BaseModel):
    name: str | None = None
    cards: list[DeckCardIn] | None = None


class DeckCardOut(BaseModel):
    card: CardOut
    quantity: int

    model_config = {"from_attributes": True}


class DeckOut(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime
    deck_cards: list[DeckCardOut] = []
    total_cards: int = 0

    model_config = {"from_attributes": True}