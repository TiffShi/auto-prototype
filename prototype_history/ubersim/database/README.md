# Database Layer — Ride-Sharing Simulator

## Engine: PostgreSQL 15

### Why PostgreSQL?
PostgreSQL was selected because:
- The architecture plan explicitly specifies it as the database engine.
- Native `UUID` primary key support (`gen_random_uuid()`) matches the ORM model.
- `TIMESTAMPTZ` columns provide timezone-aware timestamps required by the backend.
- `DOUBLE PRECISION` columns map directly to SQLAlchemy's `Double` type.
- Robust support for concurrent async connections via `asyncpg` (used by the FastAPI backend).
- `CREATE TABLE IF NOT EXISTS` and `INSERT ... ON CONFLICT DO NOTHING` make schema/seed
  operations fully idempotent.

---

## Environment Variable

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://rideshare_user:rideshare_pass@localhost:5432/rideshare` |

> **Inside Docker Compose** the backend uses the async variant:
> `postgresql+asyncpg://rideshare_user:rideshare_pass@database:5432/rideshare`
>
> The `init_db.py` script automatically strips the `+asyncpg` prefix so it can
> use the synchronous `psycopg2` driver.

---

## Files

| File | Purpose |
|---|---|
| `schema.sql` | `CREATE TABLE trips` + indexes (idempotent) |
| `seed.sql` | 8 realistic completed trips in London (idempotent) |
| `init_db.py` | Python script — runs schema then seed against `DATABASE_URL` |
| `db_container_setup.sh` | Full PostgreSQL install + start + DB creation + init (for containers) |

---

## Running the Init Script Manually

### Prerequisites