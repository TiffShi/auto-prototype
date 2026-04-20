"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("user", "admin", name="userrole"),
            nullable=False,
            server_default="user",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # categories
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_categories_id", "categories", ["id"])

    # modifiers
    op.create_table(
        "modifiers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column(
            "type",
            sa.Enum("size", "milk", "extra", name="modifiertype"),
            nullable=False,
        ),
        sa.Column(
            "price_delta",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0.00",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_modifiers_id", "modifiers", ["id"])

    # drinks
    op.create_table(
        "drinks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_drinks_id", "drinks", ["id"])
    op.create_index("ix_drinks_name", "drinks", ["name"])

    # drink_modifiers
    op.create_table(
        "drink_modifiers",
        sa.Column("drink_id", sa.Integer(), nullable=False),
        sa.Column("modifier_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["drink_id"], ["drinks.id"]),
        sa.ForeignKeyConstraint(["modifier_id"], ["modifiers.id"]),
        sa.PrimaryKeyConstraint("drink_id", "modifier_id"),
    )

    # orders
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending", "in_progress", "ready", "completed", "cancelled",
                name="orderstatus",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_id", "orders", ["id"])

    # order_items
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("drink_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("customization_notes", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(["drink_id"], ["drinks.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_id", "order_items", ["id"])

    # order_item_modifiers
    op.create_table(
        "order_item_modifiers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_item_id", sa.Integer(), nullable=False),
        sa.Column("modifier_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["modifier_id"], ["modifiers.id"]),
        sa.ForeignKeyConstraint(["order_item_id"], ["order_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_item_modifiers_id", "order_item_modifiers", ["id"])


def downgrade() -> None:
    op.drop_table("order_item_modifiers")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("drink_modifiers")
    op.drop_table("drinks")
    op.drop_table("modifiers")
    op.drop_table("categories")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS modifiertype")
    op.execute("DROP TYPE IF EXISTS userrole")