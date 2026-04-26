import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from core.database import get_db
from core.security import get_current_user
from models.deck import Deck, DeckCard
from models.game import GameRoom, RoomStatus
from models.user import User
from schemas.game import GameCreate, GameJoin, GameRoomOut

router = APIRouter(prefix="/games", tags=["games"])


def _generate_room_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


def _get_deck_or_raise(db: Session, deck_id: int, user_id: int) -> Deck:
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or does not belong to you")
    total = sum(dc.quantity for dc in db.query(DeckCard).filter(DeckCard.deck_id == deck_id).all())
    if total < 20:
        raise HTTPException(status_code=400, detail="Deck must have at least 20 cards to play")
    return deck


@router.post("/create", response_model=GameRoomOut, status_code=status.HTTP_201_CREATED)
def create_game(
    payload: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_deck_or_raise(db, payload.deck_id, current_user.id)

    # Generate unique room code
    for _ in range(10):
        code = _generate_room_code()
        if not db.query(GameRoom).filter(GameRoom.room_code == code).first():
            break
    else:
        raise HTTPException(status_code=500, detail="Could not generate unique room code")

    room = GameRoom(
        room_code=code,
        player1_id=current_user.id,
        player1_deck_id=payload.deck_id,
        status=RoomStatus.waiting,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return GameRoomOut.model_validate(room)


@router.post("/join", response_model=GameRoomOut)
def join_game(
    payload: GameJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_deck_or_raise(db, payload.deck_id, current_user.id)

    room = db.query(GameRoom).filter(GameRoom.room_code == payload.room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != RoomStatus.waiting:
        raise HTTPException(status_code=400, detail="Room is not available to join")
    if room.player1_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot join your own room")

    room.player2_id = current_user.id
    room.player2_deck_id = payload.deck_id
    room.status = RoomStatus.active
    db.commit()
    db.refresh(room)
    return GameRoomOut.model_validate(room)


@router.get("/{room_code}", response_model=GameRoomOut)
def get_game(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.player1_id != current_user.id and room.player2_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not a participant in this game")
    return GameRoomOut.model_validate(room)