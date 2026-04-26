from datetime import datetime
from pydantic import BaseModel
from models.game import RoomStatus


class GameCreate(BaseModel):
    deck_id: int


class GameJoin(BaseModel):
    room_code: str
    deck_id: int


class GameRoomOut(BaseModel):
    id: int
    room_code: str
    player1_id: int
    player2_id: int | None
    player1_deck_id: int | None
    player2_deck_id: int | None
    status: RoomStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class FieldCreature(BaseModel):
    instance_id: str
    card_id: int
    name: str
    attack: int
    defense: int
    current_defense: int
    cost: int
    image_key: str
    has_attacked: bool = False
    summoning_sickness: bool = True


class PlayerState(BaseModel):
    user_id: int
    username: str
    hp: int
    mana: int
    max_mana: int
    hand_count: int
    hand: list[dict] = []
    field: list[FieldCreature] = []
    deck_count: int


class GameStateOut(BaseModel):
    room_code: str
    status: str
    turn: str  # "player1" | "player2"
    turn_number: int
    player1: PlayerState
    player2: PlayerState
    last_action: str | None = None
    game_log: list[str] = []
    winner: str | None = None