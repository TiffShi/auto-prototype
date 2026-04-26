import json
from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session, joinedload

from core.database import SessionLocal
from core.security import decode_token
from models.game import GameRoom, GameHistory, RoomStatus
from models.deck import Deck, DeckCard
from models.user import User
from game_engine.state import (
    get_raw_state,
    set_raw_state,
    initialize_game,
    serialize_state_for_player,
)
from game_engine.actions import play_card, attack, end_turn, ActionError


# Connection manager: room_code -> list of (websocket, user_id)
class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[tuple[WebSocket, int]]] = {}

    def connect(self, room_code: str, ws: WebSocket, user_id: int):
        if room_code not in self.rooms:
            self.rooms[room_code] = []
        self.rooms[room_code].append((ws, user_id))

    def disconnect(self, room_code: str, ws: WebSocket):
        if room_code in self.rooms:
            self.rooms[room_code] = [
                (w, uid) for w, uid in self.rooms[room_code] if w != ws
            ]
            if not self.rooms[room_code]:
                del self.rooms[room_code]

    async def broadcast(self, room_code: str, state: dict):
        """Send state to all connected clients, masking opponent hands."""
        if room_code not in self.rooms:
            return
        dead = []
        for ws, user_id in self.rooms[room_code]:
            try:
                personalized = serialize_state_for_player(state, user_id)
                await ws.send_text(json.dumps({
                    "event": "state_update",
                    "game_state": personalized,
                }))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(room_code, ws)

    async def send_error(self, ws: WebSocket, message: str):
        try:
            await ws.send_text(json.dumps({"event": "error", "message": message}))
        except Exception:
            pass

    async def send_game_over(self, room_code: str, winner_key: str, state: dict):
        if room_code not in self.rooms:
            return
        winner_username = state[winner_key]["username"]
        for ws, _ in self.rooms[room_code]:
            try:
                await ws.send_text(json.dumps({
                    "event": "game_over",
                    "winner": winner_key,
                    "winner_username": winner_username,
                }))
            except Exception:
                pass


manager = ConnectionManager()


async def game_websocket_endpoint(websocket: WebSocket, room_code: str):
    await websocket.accept()

    db: Session = SessionLocal()
    user_id: Optional[int] = None

    try:
        # Authenticate via token in first message
        auth_msg = await websocket.receive_text()
        auth_data = json.loads(auth_msg)

        if auth_data.get("action") != "auth":
            await websocket.send_text(json.dumps({"event": "error", "message": "First message must be auth"}))
            await websocket.close()
            return

        token = auth_data.get("token", "")
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception:
            await websocket.send_text(json.dumps({"event": "error", "message": "Invalid token"}))
            await websocket.close()
            return

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.send_text(json.dumps({"event": "error", "message": "User not found"}))
            await websocket.close()
            return

        # Validate room
        room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
        if not room:
            await websocket.send_text(json.dumps({"event": "error", "message": "Room not found"}))
            await websocket.close()
            return

        if room.player1_id != user_id and room.player2_id != user_id:
            await websocket.send_text(json.dumps({"event": "error", "message": "You are not in this room"}))
            await websocket.close()
            return

        if room.status == RoomStatus.waiting:
            await websocket.send_text(json.dumps({"event": "waiting", "message": "Waiting for opponent to join"}))

        # Register connection
        manager.connect(room_code, websocket, user_id)

        # Initialize game state if both players are present and state not yet created
        if room.status == RoomStatus.active and get_raw_state(room_code) is None:
            p1_deck = (
                db.query(Deck)
                .options(joinedload(Deck.deck_cards).joinedload(DeckCard.card))
                .filter(Deck.id == room.player1_deck_id)
                .first()
            )
            p2_deck = (
                db.query(Deck)
                .options(joinedload(Deck.deck_cards).joinedload(DeckCard.card))
                .filter(Deck.id == room.player2_deck_id)
                .first()
            )
            p1_user = db.query(User).filter(User.id == room.player1_id).first()
            p2_user = db.query(User).filter(User.id == room.player2_id).first()

            state = initialize_game(
                room_code=room_code,
                player1_id=room.player1_id,
                player1_username=p1_user.username,
                player1_deck_cards=p1_deck.deck_cards,
                player2_id=room.player2_id,
                player2_username=p2_user.username,
                player2_deck_cards=p2_deck.deck_cards,
            )
            await manager.broadcast(room_code, state)

        elif room.status == RoomStatus.active:
            # Send current state to newly connected player
            state = get_raw_state(room_code)
            if state:
                personalized = serialize_state_for_player(state, user_id)
                await websocket.send_text(json.dumps({
                    "event": "state_update",
                    "game_state": personalized,
                }))

        # Main message loop
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            action = data.get("action")

            # Re-fetch room status
            db.expire(room)
            db.refresh(room)

            if room.status == RoomStatus.waiting:
                await manager.send_error(websocket, "Game has not started yet")
                continue

            if room.status == RoomStatus.finished:
                await manager.send_error(websocket, "Game is already finished")
                continue

            try:
                if action == "play_card":
                    instance_id = data.get("instance_id")
                    target_id = data.get("target_id")
                    if not instance_id:
                        await manager.send_error(websocket, "instance_id required")
                        continue
                    state = play_card(room_code, user_id, instance_id, target_id)

                elif action == "attack":
                    attacker_id = data.get("attacker_id")
                    target_id = data.get("target_id")
                    if not attacker_id:
                        await manager.send_error(websocket, "attacker_id required")
                        continue
                    state = attack(room_code, user_id, attacker_id, target_id)

                elif action == "end_turn":
                    state = end_turn(room_code, user_id)

                elif action == "get_state":
                    state = get_raw_state(room_code)
                    if state:
                        personalized = serialize_state_for_player(state, user_id)
                        await websocket.send_text(json.dumps({
                            "event": "state_update",
                            "game_state": personalized,
                        }))
                    continue

                else:
                    await manager.send_error(websocket, f"Unknown action: {action}")
                    continue

                # Broadcast updated state
                await manager.broadcast(room_code, state)

                # Check for game over
                if state.get("status") == "finished":
                    winner_key = state.get("winner")
                    await manager.send_game_over(room_code, winner_key, state)

                    # Persist game history
                    winner_user_id = state[winner_key]["user_id"] if winner_key else None
                    history = GameHistory(
                        room_id=room.id,
                        winner_id=winner_user_id,
                        turns_played=state.get("turn_number", 0),
                    )
                    db.add(history)
                    room.status = RoomStatus.finished
                    db.commit()

            except ActionError as e:
                await manager.send_error(websocket, str(e))
            except Exception as e:
                await manager.send_error(websocket, f"Server error: {str(e)}")

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"event": "error", "message": str(e)}))
        except Exception:
            pass
    finally:
        if user_id is not None:
            manager.disconnect(room_code, websocket)
        db.close()