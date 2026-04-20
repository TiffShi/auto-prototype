-- Hospital Simulator Database Schema
-- PostgreSQL schema matching SQLAlchemy ORM models exactly

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('ER', 'ICU', 'GENERAL', 'SURGERY', 'PHARMACY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE patient_status AS ENUM ('WAITING', 'IN_TREATMENT', 'DISCHARGED', 'DECEASED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('DOCTOR', 'NURSE', 'SURGEON', 'PHARMACIST', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_type AS ENUM ('DAY', 'NIGHT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory_category AS ENUM ('MEDICINE', 'EQUIPMENT', 'SUPPLIES');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('REVENUE', 'EXPENSE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE event_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- TABLE: hospitals
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospitals (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    budget           NUMERIC(15, 2) NOT NULL DEFAULT 500000.00,
    day              INTEGER     NOT NULL DEFAULT 1,
    speed_multiplier FLOAT       NOT NULL DEFAULT 1.0,
    is_paused        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: departments
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id       UUID           NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name              VARCHAR(255)   NOT NULL,
    type              department_type NOT NULL,
    bed_capacity      INTEGER        NOT NULL DEFAULT 10,
    current_occupancy INTEGER        NOT NULL DEFAULT 0,
    upgrade_level     INTEGER        NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_departments_hospital_id ON departments(hospital_id);

-- ─────────────────────────────────────────────
-- TABLE: patients
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patients (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID           NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id       UUID           REFERENCES departments(id) ON DELETE SET NULL,
    name                VARCHAR(255)   NOT NULL,
    age                 INTEGER        NOT NULL,
    condition           VARCHAR(255)   NOT NULL,
    severity            severity_level NOT NULL,
    status              patient_status NOT NULL DEFAULT 'WAITING',
    admitted_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    discharged_at       TIMESTAMPTZ,
    treatment_cost      NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ticks_in_treatment  INTEGER        NOT NULL DEFAULT 0,
    required_ticks      INTEGER        NOT NULL DEFAULT 3
);

CREATE INDEX IF NOT EXISTS idx_patients_hospital_id  ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_status       ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_department_id ON patients(department_id);

-- ─────────────────────────────────────────────
-- TABLE: staff
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id   UUID        NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id UUID        REFERENCES departments(id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    role          staff_role  NOT NULL,
    skill_level   INTEGER     NOT NULL DEFAULT 5,
    fatigue       INTEGER     NOT NULL DEFAULT 0,
    salary        NUMERIC(10, 2) NOT NULL,
    shift         shift_type  NOT NULL DEFAULT 'DAY',
    is_available  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_staff_hospital_id   ON staff(hospital_id);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);

-- ─────────────────────────────────────────────
-- TABLE: inventory
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory (
    id                UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id       UUID               NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    item_name         VARCHAR(255)       NOT NULL,
    category          inventory_category NOT NULL,
    quantity          INTEGER            NOT NULL DEFAULT 0,
    unit_cost         NUMERIC(10, 2)     NOT NULL,
    reorder_threshold INTEGER            NOT NULL DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_inventory_hospital_id ON inventory(hospital_id);

-- ─────────────────────────────────────────────
-- TABLE: financial_transactions
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS financial_transactions (
    id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID             NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    type        transaction_type NOT NULL,
    amount      NUMERIC(12, 2)   NOT NULL,
    description VARCHAR(500)     NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_hospital_id ON financial_transactions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at  ON financial_transactions(created_at DESC);

-- ─────────────────────────────────────────────
-- TABLE: events
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID           NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    event_type  VARCHAR(100)   NOT NULL,
    description TEXT           NOT NULL,
    severity    event_severity NOT NULL DEFAULT 'INFO',
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_hospital_id ON events(hospital_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at  ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity    ON events(severity);