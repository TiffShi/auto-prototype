-- ============================================================
-- Restaurant Menu Management — PostgreSQL Schema
-- ============================================================
-- Matches SQLAlchemy ORM models exactly:
--   User      → users
--   Category  → categories
--   Item      → items
-- ============================================================

-- Enable timezone-aware timestamps throughout
SET timezone = 'UTC';

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                SERIAL          PRIMARY KEY,
    email             VARCHAR(255)    NOT NULL UNIQUE,
    hashed_password   VARCHAR(255)    NOT NULL,
    restaurant_name   VARCHAR(255)    NOT NULL,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_id    ON users (id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ------------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id            SERIAL          PRIMARY KEY,
    owner_id      INTEGER         NOT NULL
                                  REFERENCES users (id)
                                  ON DELETE CASCADE,
    name          VARCHAR(255)    NOT NULL,
    description   TEXT,
    sort_order    INTEGER         NOT NULL DEFAULT 0,
    is_published  BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_categories_id       ON categories (id);
CREATE INDEX IF NOT EXISTS ix_categories_owner_id ON categories (owner_id);

-- ------------------------------------------------------------
-- Table: items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
    id            SERIAL          PRIMARY KEY,
    category_id   INTEGER         NOT NULL
                                  REFERENCES categories (id)
                                  ON DELETE CASCADE,
    name          VARCHAR(255)    NOT NULL,
    description   TEXT,
    price         NUMERIC(10, 2)  NOT NULL,
    image_url     VARCHAR(1024),
    is_available  BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order    INTEGER         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_items_id          ON items (id);
CREATE INDEX IF NOT EXISTS ix_items_category_id ON items (category_id);