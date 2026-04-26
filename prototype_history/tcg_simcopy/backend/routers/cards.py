from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.card import Card
from models.user import User
from schemas.card import CardOut
from services.minio_service import get_presigned_url

router = APIRouter(prefix="/cards", tags=["cards"])


def enrich_card(card: Card) -> CardOut:
    out = CardOut.model_validate(card)
    if card.image_key:
        out.image_url = get_presigned_url(card.image_key)
    return out


@router.get("", response_model=list[CardOut])
def list_cards(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    cards = db.query(Card).order_by(Card.id).all()
    return [enrich_card(c) for c in cards]


@router.get("/{card_id}", response_model=CardOut)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return enrich_card(card)