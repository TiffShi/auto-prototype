# Database Layer — Starbucks Ordering App

## Engine

**PostgreSQL 15** was chosen because:

- The backend ORM (SQLAlchemy 2) and migration tool (Alembic) have first-class PostgreSQL support.
- Native `ENUM` types map directly to the Python `enum.Enum` models (`userrole`, `modifiertype`, `orderstatus`).
- The `JSON` column type used for `order_items.customization_notes` is natively supported and indexable.
- `NUMERIC(10,2)` gives exact decimal arithmetic for prices — critical for a commerce application.
- `TIMESTAMPTZ` stores all timestamps with timezone awareness, matching SQLAlchemy's `DateTime(timezone=True)`.

---

## Environment Variable

| Variable | Default (local dev) | Docker Compose value |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/appdb` | `postgresql://user:pass@db:5432/starbucks_db` |

Set this variable before running the init script or starting the backend.

---

## Running the Init Script Manually

### Prerequisites