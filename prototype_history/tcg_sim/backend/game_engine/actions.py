import uuid
from typing import Optional
from game_engine.rules import (
    check_win_condition,
    get_active_player_key,
    get_opponent_key,
    validate_mana,
    find_card_in_hand,
    find_creature_on_field,
)
from game_engine.state import get_raw_state, set_raw_state, _draw_cards


class ActionError(Exception):
    pass


def _get_state_or_raise(room_code: str) -> dict:
    state = get_raw_state(room_code)
    if state is None:
        raise ActionError("Game state not found")
    return state


def play_card(room_code: str, user_id: int, instance_id: str, target_id: Optional[str] = None) -> dict:
    state = _get_state_or_raise(room_code)

    if state["status"] != "active":
        raise ActionError("Game is not active")

    active_key = get_active_player_key(state)
    opponent_key = get_opponent_key(state)
    active_player = state[active_key]

    if active_player["user_id"] != user_id:
        raise ActionError("It is not your turn")

    card = find_card_in_hand(active_player, instance_id)
    if card is None:
        raise ActionError("Card not found in hand")

    if not validate_mana(active_player, card["cost"]):
        raise ActionError(f"Not enough mana (need {card['cost']}, have {active_player['mana']})")

    # Deduct mana
    active_player["mana"] -= card["cost"]
    # Remove from hand
    active_player["hand"] = [c for c in active_player["hand"] if c.get("instance_id") != instance_id]

    log_msg = f"{active_player['username']} played {card['name']}."

    if card["type"] == "creature":
        creature = {
            "instance_id": str(uuid.uuid4()),
            "card_id": card["card_id"],
            "name": card["name"],
            "attack": card["attack"],
            "defense": card["defense"],
            "current_defense": card["defense"],
            "cost": card["cost"],
            "image_key": card["image_key"],
            "has_attacked": False,
            "summoning_sickness": True,
        }
        active_player["field"].append(creature)
        log_msg += f" Summoned {card['name']} ({card['attack']}/{card['defense']})."

    elif card["type"] == "spell":
        effect = card.get("effect_text", "").lower()
        opponent = state[opponent_key]

        if "damage" in effect:
            # Parse damage value from effect_text e.g. "Deal 3 damage"
            import re
            nums = re.findall(r"\d+", effect)
            dmg = int(nums[0]) if nums else 2
            if target_id:
                target = find_creature_on_field(opponent["field"], target_id)
                if target:
                    target["current_defense"] -= dmg
                    log_msg += f" Dealt {dmg} damage to {target['name']}."
                    if target["current_defense"] <= 0:
                        opponent["field"] = [c for c in opponent["field"] if c["instance_id"] != target_id]
                        log_msg += f" {target['name']} was destroyed."
                else:
                    opponent["hp"] -= dmg
                    log_msg += f" Dealt {dmg} damage to {opponent['username']}."
            else:
                opponent["hp"] -= dmg
                log_msg += f" Dealt {dmg} damage to {opponent['username']}."

        elif "heal" in effect:
            import re
            nums = re.findall(r"\d+", effect)
            heal = int(nums[0]) if nums else 2
            active_player["hp"] = min(20, active_player["hp"] + heal)
            log_msg += f" Healed {heal} HP."

        elif "draw" in effect:
            import re
            nums = re.findall(r"\d+", effect)
            count = int(nums[0]) if nums else 1
            draw_logs = _draw_cards(active_player, count)
            log_msg += f" Drew {count} card(s)."
            state["game_log"].extend(draw_logs)

        else:
            # Generic spell: deal 1 damage
            opponent["hp"] -= 1
            log_msg += f" Dealt 1 damage to {opponent['username']}."

    state["last_action"] = "play_card"
    state["game_log"].append(log_msg)

    winner = check_win_condition(state)
    if winner:
        state["status"] = "finished"
        state["winner"] = winner
        state["game_log"].append(f"Game over! {state[winner]['username']} wins!")

    set_raw_state(room_code, state)
    return state


def attack(room_code: str, user_id: int, attacker_instance_id: str, target_instance_id: Optional[str] = None) -> dict:
    state = _get_state_or_raise(room_code)

    if state["status"] != "active":
        raise ActionError("Game is not active")

    active_key = get_active_player_key(state)
    opponent_key = get_opponent_key(state)
    active_player = state[active_key]
    opponent = state[opponent_key]

    if active_player["user_id"] != user_id:
        raise ActionError("It is not your turn")

    attacker = find_creature_on_field(active_player["field"], attacker_instance_id)
    if attacker is None:
        raise ActionError("Attacker not found on your field")

    if attacker.get("summoning_sickness"):
        raise ActionError("This creature has summoning sickness and cannot attack yet")

    if attacker.get("has_attacked"):
        raise ActionError("This creature has already attacked this turn")

    log_msg = f"{active_player['username']}'s {attacker['name']} attacks"

    if target_instance_id:
        # Attack a specific creature
        target = find_creature_on_field(opponent["field"], target_instance_id)
        if target is None:
            raise ActionError("Target creature not found on opponent's field")

        log_msg += f" {opponent['username']}'s {target['name']}."

        # Combat damage
        target["current_defense"] -= attacker["attack"]
        attacker["current_defense"] -= target["attack"]

        destroyed = []
        if target["current_defense"] <= 0:
            opponent["field"] = [c for c in opponent["field"] if c["instance_id"] != target_instance_id]
            destroyed.append(target["name"])
        if attacker["current_defense"] <= 0:
            active_player["field"] = [c for c in active_player["field"] if c["instance_id"] != attacker_instance_id]
            destroyed.append(attacker["name"])

        if destroyed:
            log_msg += f" Destroyed: {', '.join(destroyed)}."

    else:
        # Direct attack on opponent
        if opponent["field"]:
            raise ActionError("Cannot attack directly while opponent has creatures on the field")

        opponent["hp"] -= attacker["attack"]
        log_msg += f" {opponent['username']} directly for {attacker['attack']} damage."

    # Mark attacker as having attacked (only if still alive)
    for c in active_player["field"]:
        if c["instance_id"] == attacker_instance_id:
            c["has_attacked"] = True
            break

    state["last_action"] = "attack"
    state["game_log"].append(log_msg)

    winner = check_win_condition(state)
    if winner:
        state["status"] = "finished"
        state["winner"] = winner
        state["game_log"].append(f"Game over! {state[winner]['username']} wins!")

    set_raw_state(room_code, state)
    return state


def end_turn(room_code: str, user_id: int) -> dict:
    state = _get_state_or_raise(room_code)

    if state["status"] != "active":
        raise ActionError("Game is not active")

    active_key = get_active_player_key(state)
    active_player = state[active_key]

    if active_player["user_id"] != user_id:
        raise ActionError("It is not your turn")

    # Switch turn
    next_turn = "player2" if active_key == "player1" else "player1"
    state["turn"] = next_turn
    state["turn_number"] += 1

    next_player = state[next_turn]

    # Reset mana for next player
    if next_player["mana"] >= 10:
        next_player["mana"] = 10
    else:
        next_player["mana"] += 1

    # Remove summoning sickness from next player's creatures
    for creature in next_player["field"]:
        creature["summoning_sickness"] = False
        creature["has_attacked"] = False

    # Draw a card for next player
    draw_logs = _draw_cards(next_player, 1)
    state["game_log"].extend(draw_logs)

    log_msg = f"{active_player['username']} ended their turn. {next_player['username']}'s turn begins."
    state["game_log"].append(log_msg)
    state["last_action"] = "end_turn"

    set_raw_state(room_code, state)
    return state