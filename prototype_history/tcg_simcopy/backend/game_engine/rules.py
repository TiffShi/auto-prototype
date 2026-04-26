from typing import Optional


def check_win_condition(state: dict) -> Optional[str]:
    """Return 'player1' or 'player2' if a win condition is met, else None."""
    if state["player1"]["hp"] <= 0:
        return "player2"
    if state["player2"]["hp"] <= 0:
        return "player1"
    return None


def get_active_player_key(state: dict) -> str:
    return state["turn"]  # "player1" or "player2"


def get_opponent_key(state: dict) -> str:
    return "player2" if state["turn"] == "player1" else "player1"


def validate_mana(player_state: dict, cost: int) -> bool:
    return player_state["mana"] >= cost


def find_card_in_hand(player_state: dict, instance_id: str) -> Optional[dict]:
    for card in player_state["hand"]:
        if card.get("instance_id") == instance_id:
            return card
    return None


def find_creature_on_field(field: list, instance_id: str) -> Optional[dict]:
    for creature in field:
        if creature.get("instance_id") == instance_id:
            return creature
    return None