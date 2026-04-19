# Database Layer — Minecraft Mod Conflict Tracker

## Engine: PostgreSQL 15

### Why PostgreSQL?
- The Product Manager explicitly selected PostgreSQL.
- UUID primary keys are natively supported via the `pgcrypto` extension (`gen_random_uuid()`).
- `TIMESTAMPTZ` columns store timezone-aware timestamps, matching the SQLAlchemy
  `DateTime(timezone=True)` columns in `backend/models.py`.
- Full-text `ILIKE` search used by the `/api/conflicts?search=` endpoint performs
  well with the B-tree indexes defined in `schema.sql`.
- The `BEFORE UPDATE` trigger automatically maintains `updated_at`, providing a
  server-side safety net alongside the SQLAlchemy `onupdate` hook.

---

## Environment Variable

| Variable | Default value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/mod_conflicts_db` |

The backend (`backend/database.py`) reads this same variable.  
When running inside Docker Compose the hostname is `db` (the service name):