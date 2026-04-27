-- ============================================================
-- Restaurant Menu Management — PostgreSQL Schema
-- Matches SQLAlchemy ORM models exactly:
--   app/models/user.py      → users
--   app/models/category.py  → categories
--   app/models/menu_item.py → menu_items
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
-- NOTE: pgcrypto is available in the official postgres:15 image by default.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id               UUID          NOT NULL DEFAULT gen_random_uuid(),
    email            VARCHAR(255)  NOT NULL,
    hashed_password  VARCHAR(255)  NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    owner_id    UUID         NOT NULL,

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_categories_owner
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_categories_owner_id ON categories (owner_id);

-- ------------------------------------------------------------
-- menu_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id           UUID           NOT NULL DEFAULT gen_random_uuid(),
    category_id  UUID           NOT NULL,
    name         VARCHAR(255)   NOT NULL,
    description  TEXT,
    price        NUMERIC(10, 2) NOT NULL,
    image_url    VARCHAR(1024),
    is_available BOOLEAN        NOT NULL DEFAULT TRUE,
    sort_order   INTEGER        NOT NULL DEFAULT 0,

    CONSTRAINT pk_menu_items PRIMARY KEY (id),
    CONSTRAINT fk_menu_items_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_menu_items_category_id ON menu_items (category_id);