-- Minecraft Mod Conflict Tracker — PostgreSQL Schema
-- Matches backend/models.py ModConflict ORM model exactly.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS mod_conflicts (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_mod       VARCHAR(255) NOT NULL,
    conflicting_mod   VARCHAR(255) NOT NULL,
    crash_log_snippet TEXT,
    is_resolved       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index on id is implicit via PRIMARY KEY; add explicit index to match ORM index=True
CREATE INDEX IF NOT EXISTS ix_mod_conflicts_id ON mod_conflicts (id);

-- Index to speed up common filter queries
CREATE INDEX IF NOT EXISTS ix_mod_conflicts_is_resolved ON mod_conflicts (is_resolved);
CREATE INDEX IF NOT EXISTS ix_mod_conflicts_created_at  ON mod_conflicts (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_mod_conflicts_primary_mod ON mod_conflicts (primary_mod);
CREATE INDEX IF NOT EXISTS ix_mod_conflicts_conflicting_mod ON mod_conflicts (conflicting_mod);

-- Trigger function: auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mod_conflicts_updated_at ON mod_conflicts;
CREATE TRIGGER trg_mod_conflicts_updated_at
    BEFORE UPDATE ON mod_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();