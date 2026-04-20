# Hospital Simulator — Database Layer

## Engine

**PostgreSQL 15** was chosen because:

- The architecture requires UUID primary keys, ENUM types, and JSONB-ready
  columns — all first-class PostgreSQL features.
- The backend ORM (SQLAlchemy 2 + asyncpg) targets PostgreSQL natively.
- `gen_random_uuid()` (via the `pgcrypto` extension) matches the
  `default=uuid.uuid4` strategy used in every SQLAlchemy model.
- `TIMESTAMPTZ` columns preserve timezone information for the real-time
  simulation event log.

---

## Environment Variable

| Variable | Default value |
|---|---|
| `DATABASE_URL` | `postgresql://admin:secret@localhost:5432/hospital_sim` |

The backend also accepts `postgresql+asyncpg://…` — the init script strips
the `+asyncpg` prefix automatically so it can use the synchronous
`psycopg2` driver.

---

## Files

| File | Purpose |
|---|---|
| `schema.sql` | DDL — all tables, ENUMs, and indexes |
| `seed.sql` | Realistic sample data (2 hospitals, departments, patients, staff, inventory, transactions, events) |
| `init_db.py` | Python script that runs schema + seed idempotently |
| `db_container_setup.sh` | Bootstraps a PostgreSQL container from scratch |

---

## Running the Init Script Manually

### Prerequisites