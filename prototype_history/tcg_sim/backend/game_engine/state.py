import random
import uuid
from typing import Optional
from schemas.game import GameStateOut, PlayerState, FieldCreature


# In-memory store: room_code -> raw game state dict
_game_states: dict[str, dict] = {}


def get_raw_state(room_code: str) -> Optional[dict]:
    return _game_states.get(room_code)


def set_raw_state(room_code: str, state: dict) -> None:
    _game_states[room_code] = state


def delete_state(room_code: str) -> None:
    _game_states.pop(room_code, None)


def _build_deck_list(deck_cards: list) -> list[dict]:
    """Expand deck_cards (with quantity) into a flat list of card dicts."""
    cards = []
    for dc in deck_cards:
        card = dc.card
        for _ in range(dc.quantity):
            cards.append({
                "card_id": card.id,
                "name": card.name,
                "attack": card.attack,
                "defense": card.defense,
                "cost": card.cost,
                "type": card.type.value,
                "effect_text": card.effect_text,
                "image_key": card.image_key,
                "rarity": card.rarity.value,
            })
    random.shuffle(cards)
    return cards


def _draw_cards(player_state: dict, count: int) -> list[str]:
    """Draw `count` cards from player's deck into hand. Returns log messages."""
    logs = []
    for _ in range(count):
        if not player_state["deck"]:
            logs.append(f"{player_state['username']} has no cards left to draw!")
            break
        card = player_state["deck"].pop(0)
        card["instance_id"] = str(uuid.uuid4())
        player_state["hand"].append(card)
        logs.append(f"{player_state['username']} drew a card.")
    return logs


def initialize_game(
    room_code: str,
    player1_id: int,
    player1_username: str,
    player1_deck_cards: list,
    player2_id: int,
    player2_username: str,
    player2_deck_cards: list,
) -> dict:
    """Build and store the initial game state."""
    p1_deck = _build_deck_list(player1_deck_cards)
    p2_deck = _build_deck_list(player2_deck_cards)

    state = {
        "room_code": room_code,
        "status": "active",
        "turn": "player1",
        "turn_number": 1,
        "winner": None,
        "last_action": None,
        "game_log": [],
        "player1": {
            "user_id": player1_id,
            "username": player1_username,
            "hp": 20,
            "mana": 3,
            "max_mana": 10,
            "hand": [],
            "field": [],
            "deck": p1_deck,
        },
        "player2": {
            "user_id": player2_id,
            "username": player2_username,
            "hp": 20,
            "mana": 3,
            "max_mana": 10,
            "hand": [],
            "field": [],
            "deck": p2_deck,
        },
    }

    # Draw initial 5 cards each
    logs = _draw_cards(state["player1"], 5)
    logs += _draw_cards(state["player2"], 5)
    state["game_log"].extend(logs)
    state["game_log"].append("Game started! Player 1 goes first.")

    set_raw_state(room_code, state)
    return state


def serialize_state_for_player(state: dict, viewer_user_id: int) -> dict:
    """
    Return a copy of the state where the opponent's hand cards are hidden
    (only count is revealed).
    """
    import copy
    s = copy.deepcopy(state)

    def mask_hand(player_key: str, is_self: bool):
        p = s[player_key]
        if is_self:
            p["hand_count"] = len(p["hand"])
        else:
            p["hand_count"] = len(p["hand"])
            p["hand"] = []  # hide opponent's hand cards

    p1_is_self = s["player1"]["user_id"] == viewer_user_id
    mask_hand("player1", p1_is_self)
    mask_hand("player2", not p1_is_self)

    return s