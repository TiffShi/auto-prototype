-- Ride-Sharing Simulator — PostgreSQL Schema
-- Matches backend ORM model: app/models.py :: Trip

-- Enable pgcrypto for gen_random_uuid() if not already available
-- (gen_random_uuid() is built-in from PostgreSQL 13+; pgcrypto is a fallback)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS trips (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    status              VARCHAR(30)     NOT NULL DEFAULT 'SEARCHING_FOR_DRIVER',
    pickup_lat          DOUBLE PRECISION NOT NULL,
    pickup_lng          DOUBLE PRECISION NOT NULL,
    dropoff_lat         DOUBLE PRECISION NOT NULL,
    dropoff_lng         DOUBLE PRECISION NOT NULL,
    driver_origin_lat   DOUBLE PRECISION,
    driver_origin_lng   DOUBLE PRECISION,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for listing trips ordered by creation time (used by list_trips())
CREATE INDEX IF NOT EXISTS idx_trips_created_at
    ON trips (created_at DESC);

-- Index for status-based filtering / monitoring queries
CREATE INDEX IF NOT EXISTS idx_trips_status
    ON trips (status);