"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from sqlalchemy import inspect as sa_inspect

    bind = op.get_bind()
    inspector = sa_inspect(bind)
    existing_tables = inspector.get_table_names()

    # ── users ──────────────────────────────────────────────────────────────
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("email", sa.String(255), nullable=False),
            sa.Column("hashed_password", sa.String(255), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── boards ─────────────────────────────────────────────────────────────
    if "boards" not in existing_tables:
        op.create_table(
            "boards",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text, nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
            sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_boards_owner_id", "boards", ["owner_id"])

    # ── columns ────────────────────────────────────────────────────────────
    if "columns" not in existing_tables:
        op.create_table(
            "columns",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("board_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("order", sa.Integer, nullable=False, server_default="0"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
            sa.ForeignKeyConstraint(["board_id"], ["boards.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_columns_board_id", "columns", ["board_id"])

    # ── priority enum + cards ──────────────────────────────────────────────
    bind.execute(sa.text(
        "DO $$ BEGIN "
        "IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_enum') THEN "
        "CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high'); "
        "END IF; "
        "END $$;"
    ))

    if "cards" not in existing_tables:
        op.create_table(
            "cards",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("column_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text, nullable=True),
            sa.Column("due_date", sa.Date, nullable=True),
            sa.Column(
                "priority",
                sa.Enum("low", "medium", "high", name="priority_enum", create_type=False),
                nullable=False,
                server_default="medium",
            ),
            sa.Column("order", sa.Integer, nullable=False, server_default="0"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
            sa.ForeignKeyConstraint(["column_id"], ["columns.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_cards_column_id", "cards", ["column_id"])


def downgrade() -> None:
    op.drop_index("ix_cards_column_id", table_name="cards")
    op.drop_table("cards")

    op.execute("DROP TYPE IF EXISTS priority_enum")

    op.drop_index("ix_columns_board_id", table_name="columns")
    op.drop_table("columns")

    op.drop_index("ix_boards_owner_id", table_name="boards")
    op.drop_table("boards")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")