-- ============================================================
-- Kanban App — PostgreSQL 15 Schema
-- Matches SQLAlchemy ORM models exactly
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Priority ENUM ─────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_enum') THEN
        CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');
    END IF;
END$$;

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               UUID          NOT NULL DEFAULT gen_random_uuid(),
    email            VARCHAR(255)  NOT NULL,
    hashed_password  VARCHAR(255)  NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ── boards ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS boards (
    id           UUID          NOT NULL DEFAULT gen_random_uuid(),
    owner_id     UUID          NOT NULL,
    title        VARCHAR(255)  NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_boards PRIMARY KEY (id),
    CONSTRAINT fk_boards_owner_id FOREIGN KEY (owner_id)
        REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_boards_owner_id ON boards (owner_id);

-- ── columns ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS columns (
    id          UUID          NOT NULL DEFAULT gen_random_uuid(),
    board_id    UUID          NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    "order"     INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_columns PRIMARY KEY (id),
    CONSTRAINT fk_columns_board_id FOREIGN KEY (board_id)
        REFERENCES boards (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_columns_board_id ON columns (board_id);

-- ── cards ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
    id           UUID          NOT NULL DEFAULT gen_random_uuid(),
    column_id    UUID          NOT NULL,
    title        VARCHAR(255)  NOT NULL,
    description  TEXT,
    due_date     DATE,
    priority     priority_enum NOT NULL DEFAULT 'medium',
    "order"      INTEGER       NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_cards PRIMARY KEY (id),
    CONSTRAINT fk_cards_column_id FOREIGN KEY (column_id)
        REFERENCES columns (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_cards_column_id ON cards (column_id);