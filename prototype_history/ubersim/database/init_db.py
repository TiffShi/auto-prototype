#!/usr/bin/env python3
"""
database/init_db.py
-------------------
Standalone script that initialises the Ride-Sharing Simulator database.

Usage:
    DATABASE_URL=postgresql://rideshare_user:rideshare_pass@localhost:5432/rideshare \
        python database/init_db.py

The script:
  1. Reads DATABASE_URL from the environment.
  2. Connects to PostgreSQL using psycopg2 (synchronous, no ORM dependency).
  3. Runs database/schema.sql  (idempotent — uses CREATE TABLE IF NOT EXISTS).
  4. Runs database/seed.sql    (idempotent — uses INSERT ... ON CONFLICT DO NOTHING).
"""

import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Dependency check — psycopg2 is the standard synchronous PostgreSQL driver
# for Python.  Install with:  pip install psycopg2-binary
# ---------------------------------------------------------------------------
try:
    import psycopg2
    from psycopg2 import sql as pg_sql
except ImportError:
    print(
        "ERROR: psycopg2 is not installed.\n"
        "Install it with:  pip install psycopg2-binary",
        file=sys.stderr,
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Resolve file paths relative to this script's location
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE = SCRIPT_DIR / "seed.sql"


def read_sql_file(path: Path) -> str:
    if not path.exists():
        print(f"ERROR: SQL file not found: {path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print(
            "ERROR: DATABASE_URL environment variable is not set.\n"
            "Example:\n"
            "  export DATABASE_URL=postgresql://rideshare_user:rideshare_pass@localhost:5432/rideshare",
            file=sys.stderr,
        )
        sys.exit(1)

    # SQLAlchemy async prefix is not understood by psycopg2 — strip it.
    # e.g. "postgresql+asyncpg://..." → "postgresql://..."
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "")
    if "+psycopg2" in url:
        url = url.replace("+psycopg2", "")

    return url


def run_sql_file(cursor, path: Path, label: str) -> None:
    print(f"  Running {label} ({path.name})…", end=" ", flush=True)
    sql_text = read_sql_file(path)
    cursor.execute(sql_text)
    print("OK")


def main() -> None:
    database_url = get_database_url()

    print("=" * 60)
    print("Ride-Sharing Simulator — Database Initialisation")
    print("=" * 60)
    print(f"  Connecting to: {database_url}")

    try:
        conn = psycopg2.connect(database_url)
    except psycopg2.OperationalError as exc:
        print(f"\nERROR: Could not connect to the database.\n{exc}", file=sys.stderr)
        sys.exit(1)

    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            # ── 1. Apply schema ──────────────────────────────────────────
            run_sql_file(cur, SCHEMA_FILE, "schema")

            # ── 2. Apply seed data ───────────────────────────────────────
            run_sql_file(cur, SEED_FILE, "seed")

        conn.commit()
        print("\n✓ Database initialised successfully.")

    except Exception as exc:
        conn.rollback()
        print(f"\nERROR: Initialisation failed — rolling back.\n{exc}", file=sys.stderr)
        sys.exit(1)

    finally:
        conn.close()


if __name__ == "__main__":
    main()