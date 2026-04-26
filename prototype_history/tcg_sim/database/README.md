# Database Layer — Trading Card Game

## Engine

**PostgreSQL** was chosen because:

- The backend ORM (SQLAlchemy 2.x) uses PostgreSQL-specific features such as
  `TIMESTAMPTZ`, native `ENUM` types (`cardtype`, `cardrarity`, `roomstatus`),
  and `SERIAL` primary keys.
- The architecture plan explicitly specifies PostgreSQL.
- PostgreSQL's ACID guarantees and row-level locking are well-suited to the
  concurrent game-room and deck-building workflows.

---

## Environment Variable

| Variable | Default value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/appdb` |

The backend uses the Docker Compose service name `database` as the host: