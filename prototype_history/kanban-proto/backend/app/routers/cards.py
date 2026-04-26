import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate, CardOut, CardMove
from app.services.board_service import get_board
from app.services.column_service import get_column
from app.services.card_service import (
    get_cards_for_column,
    get_card,
    create_card,
    update_card,
    move_card,
    delete_card,
)

router = APIRouter(tags=["cards"])


def _verify_column_ownership(
    db: Session, column_id: uuid.UUID, user_id: uuid.UUID
):
    """Helper: ensure the column exists and belongs to the current user's board."""
    column = get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    board = get_board(db, column.board_id, user_id)
    if not board:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return column


@router.get("/api/columns/{column_id}/cards", response_model=list[CardOut])
def list_cards(
    column_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_column_ownership(db, column_id, current_user.id)
    return get_cards_for_column(db, column_id)


@router.post(
    "/api/columns/{column_id}/cards",
    response_model=CardOut,
    status_code=status.HTTP_201_CREATED,
)
def create_new_card(
    column_id: uuid.UUID,
    payload: CardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_column_ownership(db, column_id, current_user.id)
    return create_card(db, column_id, payload)


@router.get("/api/cards/{card_id}", response_model=CardOut)
def get_single_card(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_column_ownership(db, card.column_id, current_user.id)
    return card


@router.put("/api/cards/{card_id}", response_model=CardOut)
def update_existing_card(
    card_id: uuid.UUID,
    payload: CardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_column_ownership(db, card.column_id, current_user.id)
    return update_card(db, card, payload)


@router.delete("/api/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_card(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_column_ownership(db, card.column_id, current_user.id)
    delete_card(db, card)


@router.patch("/api/cards/{card_id}/move", response_model=CardOut)
def move_existing_card(
    card_id: uuid.UUID,
    payload: CardMove,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    # Verify ownership of source column
    _verify_column_ownership(db, card.column_id, current_user.id)
    # Verify ownership of destination column
    _verify_column_ownership(db, payload.column_id, current_user.id)
    return move_card(db, card, payload)