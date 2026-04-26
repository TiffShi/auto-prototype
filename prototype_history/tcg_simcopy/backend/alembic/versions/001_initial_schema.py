"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    # cards
    op.create_table(
        "cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("attack", sa.Integer(), nullable=True),
        sa.Column("defense", sa.Integer(), nullable=True),
        sa.Column("cost", sa.Integer(), nullable=True),
        sa.Column("type", sa.Enum("creature", "spell", name="cardtype"), nullable=False),
        sa.Column("effect_text", sa.Text(), nullable=True),
        sa.Column("image_key", sa.String(255), nullable=True),
        sa.Column("rarity", sa.Enum("common", "uncommon", "rare", "legendary", name="cardrarity"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_cards_id", "cards", ["id"])

    # decks
    op.create_table(
        "decks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_decks_id", "decks", ["id"])

    # deck_cards
    op.create_table(
        "deck_cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deck_id", sa.Integer(), nullable=False),
        sa.Column("card_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["card_id"], ["cards.id"]),
        sa.ForeignKeyConstraint(["deck_id"], ["decks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("deck_id", "card_id", name="uq_deck_card"),
    )
    op.create_index("ix_deck_cards_id", "deck_cards", ["id"])

    # game_rooms
    op.create_table(
        "game_rooms",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("room_code", sa.String(8), nullable=False),
        sa.Column("player1_id", sa.Integer(), nullable=False),
        sa.Column("player2_id", sa.Integer(), nullable=True),
        sa.Column("player1_deck_id", sa.Integer(), nullable=True),
        sa.Column("player2_deck_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.Enum("waiting", "active", "finished", name="roomstatus"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["player1_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["player2_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["player1_deck_id"], ["decks.id"]),
        sa.ForeignKeyConstraint(["player2_deck_id"], ["decks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("room_code"),
    )
    op.create_index("ix_game_rooms_id", "game_rooms", ["id"])
    op.create_index("ix_game_rooms_room_code", "game_rooms", ["room_code"], unique=True)

    # game_history
    op.create_table(
        "game_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("winner_id", sa.Integer(), nullable=True),
        sa.Column("turns_played", sa.Integer(), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["room_id"], ["game_rooms.id"]),
        sa.ForeignKeyConstraint(["winner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_game_history_id", "game_history", ["id"])


def downgrade() -> None:
    op.drop_table("game_history")
    op.drop_table("game_rooms")
    op.drop_table("deck_cards")
    op.drop_table("decks")
    op.drop_table("cards")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS roomstatus")
    op.execute("DROP TYPE IF EXISTS cardtype")
    op.execute("DROP TYPE IF EXISTS cardrarity")