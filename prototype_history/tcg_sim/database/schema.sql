-- ============================================================
-- Trading Card Game — PostgreSQL Schema
-- Matches SQLAlchemy ORM models exactly
-- ============================================================

-- Custom ENUM types (create only if they don't exist)
DO $$ BEGIN
    CREATE TYPE cardtype AS ENUM ('creature', 'spell');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE cardrarity AS ENUM ('common', 'uncommon', 'rare', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE roomstatus AS ENUM ('waiting', 'active', 'finished');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX        IF NOT EXISTS ix_users_id       ON users (id);

-- ============================================================
-- TABLE: cards
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    attack      INTEGER      DEFAULT 0,
    defense     INTEGER      DEFAULT 0,
    cost        INTEGER      DEFAULT 1,
    type        cardtype     NOT NULL,
    effect_text TEXT         DEFAULT '',
    image_key   VARCHAR(255) DEFAULT '',
    rarity      cardrarity   DEFAULT 'common'
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_name ON cards (name);
CREATE INDEX        IF NOT EXISTS ix_cards_id   ON cards (id);

-- ============================================================
-- TABLE: decks
-- ============================================================
CREATE TABLE IF NOT EXISTS decks (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_decks_id      ON decks (id);
CREATE INDEX IF NOT EXISTS ix_decks_user_id ON decks (user_id);

-- ============================================================
-- TABLE: deck_cards
-- ============================================================
CREATE TABLE IF NOT EXISTS deck_cards (
    id       SERIAL PRIMARY KEY,
    deck_id  INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id  INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    CONSTRAINT uq_deck_card UNIQUE (deck_id, card_id)
);

CREATE INDEX IF NOT EXISTS ix_deck_cards_id      ON deck_cards (id);
CREATE INDEX IF NOT EXISTS ix_deck_cards_deck_id ON deck_cards (deck_id);

-- ============================================================
-- TABLE: game_rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS game_rooms (
    id              SERIAL PRIMARY KEY,
    room_code       VARCHAR(8)  NOT NULL,
    player1_id      INTEGER     NOT NULL REFERENCES users(id),
    player2_id      INTEGER              REFERENCES users(id),
    player1_deck_id INTEGER              REFERENCES decks(id),
    player2_deck_id INTEGER              REFERENCES decks(id),
    status          roomstatus  DEFAULT 'waiting',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_game_rooms_room_code ON game_rooms (room_code);
CREATE INDEX        IF NOT EXISTS ix_game_rooms_id        ON game_rooms (id);

-- ============================================================
-- TABLE: game_history
-- ============================================================
CREATE TABLE IF NOT EXISTS game_history (
    id           SERIAL PRIMARY KEY,
    room_id      INTEGER     NOT NULL REFERENCES game_rooms(id),
    winner_id    INTEGER              REFERENCES users(id),
    turns_played INTEGER     DEFAULT 0,
    ended_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_game_history_id      ON game_history (id);
CREATE INDEX IF NOT EXISTS ix_game_history_room_id ON game_history (room_id);