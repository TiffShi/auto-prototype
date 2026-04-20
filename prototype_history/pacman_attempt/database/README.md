# Database Layer — Pac-Man Leaderboard

## Engine Choice

**PostgreSQL 15** was selected because:

- The architecture plan explicitly specifies PostgreSQL 15.
- The backend uses SQLAlchemy 2.x + Alembic, both of which have first-class
  PostgreSQL support.
- `SERIAL` primary keys, `TIMESTAMP DEFAULT now()`, and partial indexes are
  all native PostgreSQL features used by the ORM model.
- PostgreSQL's ACID guarantees ensure leaderboard scores are never lost or
  duplicated under concurrent submissions.

---

## Connection String