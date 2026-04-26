from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from core.database import get_db
from core.security import get_current_user
from models.card import Card
from models.deck import Deck, DeckCard
from models.user import User
from schemas.deck import DeckCreate, DeckUpdate, DeckOut, DeckCardOut
from schemas.card import CardOut
from services.minio_service import get_presigned_url

router = APIRouter(prefix="/decks", tags=["decks"])

MIN_DECK_SIZE = 20


def _total_cards(deck: Deck) -> int:
    return sum(dc.quantity for dc in deck.deck_cards)


def _enrich_deck(deck: Deck) -> DeckOut:
    deck_cards_out = []
    for dc in deck.deck_cards:
        card_out = CardOut.model_validate(dc.card)
        if dc.card.image_key:
            card_out.image_url = get_presigned_url(dc.card.image_key)
        deck_cards_out.append(DeckCardOut(card=card_out, quantity=dc.quantity))

    return DeckOut(
        id=deck.id,
        name=deck.name,
        user_id=deck.user_id,
        created_at=deck.created_at,
        deck_cards=deck_cards_out,
        total_cards=_total_cards(deck),
    )


def _load_deck(db: Session, deck_id: int, user_id: int) -> Deck:
    deck = (
        db.query(Deck)
        .options(joinedload(Deck.deck_cards).joinedload(DeckCard.card))
        .filter(Deck.id == deck_id, Deck.user_id == user_id)
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck


@router.get("", response_model=list[DeckOut])
def list_decks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decks = (
        db.query(Deck)
        .options(joinedload(Deck.deck_cards).joinedload(DeckCard.card))
        .filter(Deck.user_id == current_user.id)
        .all()
    )
    return [_enrich_deck(d) for d in decks]


@router.post("", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
def create_deck(
    payload: DeckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = sum(c.quantity for c in payload.cards)
    if total < MIN_DECK_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Deck must have at least {MIN_DECK_SIZE} cards (got {total})",
        )

    deck = Deck(name=payload.name, user_id=current_user.id)
    db.add(deck)
    db.flush()

    for card_entry in payload.cards:
        card = db.query(Card).filter(Card.id == card_entry.card_id).first()
        if not card:
            raise HTTPException(status_code=404, detail=f"Card {card_entry.card_id} not found")
        dc = DeckCard(deck_id=deck.id, card_id=card_entry.card_id, quantity=card_entry.quantity)
        db.add(dc)

    db.commit()
    return _enrich_deck(_load_deck(db, deck.id, current_user.id))


@router.get("/{deck_id}", response_model=DeckOut)
def get_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _enrich_deck(_load_deck(db, deck_id, current_user.id))


@router.put("/{deck_id}", response_model=DeckOut)
def update_deck(
    deck_id: int,
    payload: DeckUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deck = _load_deck(db, deck_id, current_user.id)

    if payload.name is not None:
        deck.name = payload.name.strip()

    if payload.cards is not None:
        total = sum(c.quantity for c in payload.cards)
        if total < MIN_DECK_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Deck must have at least {MIN_DECK_SIZE} cards (got {total})",
            )
        # Remove existing cards
        db.query(DeckCard).filter(DeckCard.deck_id == deck_id).delete()
        for card_entry in payload.cards:
            card = db.query(Card).filter(Card.id == card_entry.card_id).first()
            if not card:
                raise HTTPException(status_code=404, detail=f"Card {card_entry.card_id} not found")
            dc = DeckCard(deck_id=deck.id, card_id=card_entry.card_id, quantity=card_entry.quantity)
            db.add(dc)

    db.commit()
    return _enrich_deck(_load_deck(db, deck_id, current_user.id))


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deck = _load_deck(db, deck_id, current_user.id)
    db.delete(deck)
    db.commit()