import io
import random
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy.orm import Session
from models.card import Card, CardType, CardRarity
from services.minio_service import get_minio_client, ensure_bucket_exists, upload_image
from core.config import get_settings

settings = get_settings()

CARD_DEFINITIONS = [
    # Creatures
    {"name": "Fire Drake", "attack": 4, "defense": 2, "cost": 3, "type": CardType.creature, "effect_text": "A fierce dragon that breathes fire.", "rarity": CardRarity.rare},
    {"name": "Shield Guardian", "attack": 1, "defense": 6, "cost": 3, "type": CardType.creature, "effect_text": "A stalwart defender of the realm.", "rarity": CardRarity.uncommon},
    {"name": "Forest Wolf", "attack": 2, "defense": 2, "cost": 1, "type": CardType.creature, "effect_text": "Swift and cunning predator.", "rarity": CardRarity.common},
    {"name": "Stone Golem", "attack": 3, "defense": 5, "cost": 4, "type": CardType.creature, "effect_text": "An ancient construct of living rock.", "rarity": CardRarity.uncommon},
    {"name": "Shadow Rogue", "attack": 3, "defense": 1, "cost": 2, "type": CardType.creature, "effect_text": "Strikes from the darkness.", "rarity": CardRarity.common},
    {"name": "Sea Serpent", "attack": 5, "defense": 3, "cost": 5, "type": CardType.creature, "effect_text": "Terror of the deep seas.", "rarity": CardRarity.rare},
    {"name": "Goblin Scout", "attack": 1, "defense": 1, "cost": 1, "type": CardType.creature, "effect_text": "Small but numerous.", "rarity": CardRarity.common},
    {"name": "Iron Knight", "attack": 2, "defense": 4, "cost": 3, "type": CardType.creature, "effect_text": "Clad in impenetrable armor.", "rarity": CardRarity.uncommon},
    {"name": "Thunder Eagle", "attack": 4, "defense": 2, "cost": 4, "type": CardType.creature, "effect_text": "Strikes with lightning speed.", "rarity": CardRarity.rare},
    {"name": "Arcane Familiar", "attack": 1, "defense": 2, "cost": 1, "type": CardType.creature, "effect_text": "A magical companion.", "rarity": CardRarity.common},
    {"name": "Lava Titan", "attack": 6, "defense": 4, "cost": 6, "type": CardType.creature, "effect_text": "Born from volcanic fury.", "rarity": CardRarity.legendary},
    {"name": "Frost Witch", "attack": 2, "defense": 3, "cost": 3, "type": CardType.creature, "effect_text": "Commands the power of ice.", "rarity": CardRarity.uncommon},
    {"name": "Plague Rat", "attack": 1, "defense": 1, "cost": 1, "type": CardType.creature, "effect_text": "Spreads disease and chaos.", "rarity": CardRarity.common},
    {"name": "Celestial Dragon", "attack": 7, "defense": 5, "cost": 8, "type": CardType.creature, "effect_text": "The mightiest of all dragons.", "rarity": CardRarity.legendary},
    {"name": "Swamp Troll", "attack": 3, "defense": 3, "cost": 3, "type": CardType.creature, "effect_text": "Regenerates from wounds.", "rarity": CardRarity.common},
    # Spells
    {"name": "Fireball", "attack": 0, "defense": 0, "cost": 2, "type": CardType.spell, "effect_text": "Deal 3 damage to target.", "rarity": CardRarity.common},
    {"name": "Lightning Bolt", "attack": 0, "defense": 0, "cost": 1, "type": CardType.spell, "effect_text": "Deal 2 damage to target.", "rarity": CardRarity.common},
    {"name": "Healing Light", "attack": 0, "defense": 0, "cost": 2, "type": CardType.spell, "effect_text": "Heal 4 HP to yourself.", "rarity": CardRarity.uncommon},
    {"name": "Arcane Draw", "attack": 0, "defense": 0, "cost": 1, "type": CardType.spell, "effect_text": "Draw 2 cards.", "rarity": CardRarity.uncommon},
    {"name": "Meteor Strike", "attack": 0, "defense": 0, "cost": 4, "type": CardType.spell, "effect_text": "Deal 6 damage to target.", "rarity": CardRarity.rare},
    {"name": "Minor Heal", "attack": 0, "defense": 0, "cost": 1, "type": CardType.spell, "effect_text": "Heal 2 HP to yourself.", "rarity": CardRarity.common},
    {"name": "Blizzard", "attack": 0, "defense": 0, "cost": 3, "type": CardType.spell, "effect_text": "Deal 4 damage to target.", "rarity": CardRarity.rare},
    {"name": "Fortune's Gift", "attack": 0, "defense": 0, "cost": 2, "type": CardType.spell, "effect_text": "Draw 3 cards.", "rarity": CardRarity.rare},
    {"name": "Divine Shield", "attack": 0, "defense": 0, "cost": 3, "type": CardType.spell, "effect_text": "Heal 6 HP to yourself.", "rarity": CardRarity.rare},
    {"name": "Chaos Bolt", "attack": 0, "defense": 0, "cost": 2, "type": CardType.spell, "effect_text": "Deal 2 damage to target.", "rarity": CardRarity.common},
]

# Color palette per rarity
RARITY_COLORS = {
    CardRarity.common: (150, 150, 150),
    CardRarity.uncommon: (80, 180, 80),
    CardRarity.rare: (80, 120, 220),
    CardRarity.legendary: (220, 160, 20),
}

TYPE_COLORS = {
    CardType.creature: (180, 60, 60),
    CardType.spell: (60, 60, 180),
}


def _generate_card_image(card_def: dict) -> bytes:
    """Generate a simple colored card image using Pillow."""
    width, height = 200, 280
    img = Image.new("RGB", (width, height), color=(30, 30, 40))
    draw = ImageDraw.Draw(img)

    # Background gradient effect (simple)
    rarity_color = RARITY_COLORS.get(card_def["rarity"], (150, 150, 150))
    type_color = TYPE_COLORS.get(card_def["type"], (100, 100, 100))

    # Border
    draw.rectangle([0, 0, width - 1, height - 1], outline=rarity_color, width=4)

    # Card art area
    art_color = tuple(min(255, c + 40) for c in type_color)
    draw.rectangle([10, 10, width - 10, 150], fill=art_color)

    # Card name background
    draw.rectangle([10, 155, width - 10, 185], fill=(20, 20, 30))

    # Stats area
    draw.rectangle([10, 190, width - 10, 270], fill=(25, 25, 35))

    # Draw text (use default font)
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
        font_tiny = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = font_large
        font_tiny = font_large

    # Card name
    name = card_def["name"]
    draw.text((width // 2, 170), name, fill=(255, 255, 255), font=font_large, anchor="mm")

    # Type indicator in art area
    type_label = card_def["type"].value.upper()
    draw.text((width // 2, 80), type_label, fill=(255, 255, 255), font=font_large, anchor="mm")

    # Rarity
    rarity_label = card_def["rarity"].value.upper()
    draw.text((width // 2, 105), rarity_label, fill=rarity_color, font=font_small, anchor="mm")

    # Cost circle
    draw.ellipse([width - 35, 5, width - 5, 35], fill=(200, 180, 0))
    draw.text((width - 20, 20), str(card_def["cost"]), fill=(0, 0, 0), font=font_large, anchor="mm")

    if card_def["type"] == CardType.creature:
        # ATK / DEF
        draw.text((40, 210), f"ATK", fill=(255, 100, 100), font=font_small, anchor="mm")
        draw.text((40, 230), str(card_def["attack"]), fill=(255, 255, 255), font=font_large, anchor="mm")
        draw.text((width - 40, 210), f"DEF", fill=(100, 100, 255), font=font_small, anchor="mm")
        draw.text((width - 40, 230), str(card_def["defense"]), fill=(255, 255, 255), font=font_large, anchor="mm")

    # Effect text (truncated)
    effect = card_def.get("effect_text", "")
    if len(effect) > 30:
        effect = effect[:27] + "..."
    draw.text((width // 2, 255), effect, fill=(200, 200, 200), font=font_tiny, anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def seed_cards(db: Session) -> None:
    """Seed the database with default cards and upload images to MinIO."""
    client = get_minio_client()
    ensure_bucket_exists(client, settings.MINIO_BUCKET)

    for card_def in CARD_DEFINITIONS:
        existing = db.query(Card).filter(Card.name == card_def["name"]).first()
        if existing:
            continue

        # Generate and upload image
        image_key = f"cards/{card_def['name'].lower().replace(' ', '_')}.png"
        try:
            image_data = _generate_card_image(card_def)
            upload_image(image_data, image_key)
        except Exception as e:
            print(f"Warning: Could not upload image for {card_def['name']}: {e}")
            image_key = ""

        card = Card(
            name=card_def["name"],
            attack=card_def["attack"],
            defense=card_def["defense"],
            cost=card_def["cost"],
            type=card_def["type"],
            effect_text=card_def["effect_text"],
            image_key=image_key,
            rarity=card_def["rarity"],
        )
        db.add(card)

    db.commit()
    print(f"Seeded {len(CARD_DEFINITIONS)} cards.")