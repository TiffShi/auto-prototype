# Database Layer — Restaurant Menu Management

## Engine: PostgreSQL

PostgreSQL was chosen because:
- The backend ORM (SQLAlchemy 2.x) targets PostgreSQL via `psycopg2-binary`.
- The schema uses `SERIAL` primary keys, `TIMESTAMPTZ`, `NUMERIC(10,2)`, and
  `ON DELETE CASCADE` foreign keys — all first-class PostgreSQL features.
- The architecture plan explicitly specifies PostgreSQL.

---

## Environment Variable

The backend and init script both read a single connection string: