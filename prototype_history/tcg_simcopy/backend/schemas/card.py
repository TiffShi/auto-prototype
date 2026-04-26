from pydantic import BaseModel
from models.card import CardType, CardRarity


class CardOut(BaseModel):
    id: int
    name: str
    attack: int
    defense: int
    cost: int
    type: CardType
    effect_text: str
    image_key: str
    rarity: CardRarity
    image_url: str | None = None

    model_config = {"from_attributes": True}