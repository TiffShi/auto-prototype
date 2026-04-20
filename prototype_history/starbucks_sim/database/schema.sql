-- ============================================================
-- Starbucks-Like Drink Ordering App — PostgreSQL Schema
-- Matches SQLAlchemy ORM models exactly
-- ============================================================

-- ─── ENUM TYPES ───────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE modifiertype AS ENUM ('size', 'milk', 'extra');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE orderstatus AS ENUM ('pending', 'in_progress', 'ready', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL,
    name             VARCHAR(255) NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    role             userrole     NOT NULL DEFAULT 'user',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX        IF NOT EXISTS ix_users_id    ON users (id);

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    display_order INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT uq_categories_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS ix_categories_id ON categories (id);

-- ─── MODIFIERS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS modifiers (
    id          SERIAL      PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        modifiertype NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS ix_modifiers_id ON modifiers (id);

-- ─── DRINKS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS drinks (
    id           SERIAL PRIMARY KEY,
    category_id  INTEGER        NOT NULL REFERENCES categories (id),
    name         VARCHAR(255)   NOT NULL,
    description  TEXT,
    base_price   NUMERIC(10, 2) NOT NULL,
    image_url    VARCHAR(500),
    is_available BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_drinks_id   ON drinks (id);
CREATE INDEX IF NOT EXISTS ix_drinks_name ON drinks (name);

-- ─── DRINK_MODIFIERS (join) ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS drink_modifiers (
    drink_id    INTEGER NOT NULL REFERENCES drinks    (id),
    modifier_id INTEGER NOT NULL REFERENCES modifiers (id),
    PRIMARY KEY (drink_id, modifier_id)
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL        PRIMARY KEY,
    user_id     INTEGER        NOT NULL REFERENCES users (id),
    status      orderstatus    NOT NULL DEFAULT 'pending',
    total_price NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_orders_id ON orders (id);

-- ─── ORDER_ITEMS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
    id                   SERIAL         PRIMARY KEY,
    order_id             INTEGER        NOT NULL REFERENCES orders (id),
    drink_id             INTEGER        NOT NULL REFERENCES drinks (id),
    quantity             INTEGER        NOT NULL DEFAULT 1,
    unit_price           NUMERIC(10, 2) NOT NULL,
    customization_notes  JSON
);

CREATE INDEX IF NOT EXISTS ix_order_items_id ON order_items (id);

-- ─── ORDER_ITEM_MODIFIERS (join) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id            SERIAL  PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_items (id),
    modifier_id   INTEGER NOT NULL REFERENCES modifiers   (id)
);

CREATE INDEX IF NOT EXISTS ix_order_item_modifiers_id ON order_item_modifiers (id);