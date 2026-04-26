# Database Layer — Kanban App

## Engine

**PostgreSQL 15** was chosen because:

- The architecture plan explicitly specifies PostgreSQL 15.
- The backend uses `SQLAlchemy 2.x` with `psycopg2-binary` — the canonical PostgreSQL driver for Python.
- The data model uses PostgreSQL-native types: `UUID`, `TIMESTAMPTZ`, and a custom `ENUM` (`priority_enum`).
- Alembic migrations are written with `sqlalchemy.dialects.postgresql` constructs.
- PostgreSQL's `ON CONFLICT DO NOTHING` / `ON CONFLICT (col) DO NOTHING` syntax is used for idempotent seeding.

---

## Files

| File | Purpose |
|---|---|
| `schema.sql` | DDL — creates all tables, indexes, and the `priority_enum` type |
| `seed.sql` | DML — inserts realistic sample data (3 users, 3 boards, 10 columns, 10 cards) |
| `init_db.py` | Python script that connects via `DATABASE_URL` and runs both SQL files |
| `db_container_setup.sh` | Shell script to install PostgreSQL 15, create the role/DB, and run init |

---

## Environment Variable