-- Pac-Man Leaderboard Database Schema
-- Engine: PostgreSQL 15
-- Matches backend ORM: backend/app/models.py (Score model)

-- Drop existing objects to allow idempotent re-runs
DROP INDEX IF EXISTS ix_scores_score;
DROP TABLE IF EXISTS scores;

-- scores table
CREATE TABLE scores (
    id         SERIAL          PRIMARY KEY,
    name       VARCHAR(32)     NOT NULL,
    score      INTEGER         NOT NULL DEFAULT 0,
    level      INTEGER         NOT NULL DEFAULT 1,
    created_at TIMESTAMP       NOT NULL DEFAULT now()
);

-- Index on score column (matches Alembic migration ix_scores_score)
CREATE INDEX ix_scores_score ON scores (score);