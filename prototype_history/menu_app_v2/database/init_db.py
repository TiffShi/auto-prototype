#!/usr/bin/env python3
"""
database/init_db.py
-------------------
Standalone script that:
  1. Reads DATABASE_URL from the environment.
  2. Connects to PostgreSQL using psycopg2.
  3. Runs database/schema.sql then database/seed.sql idempotently.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant_menu \
        python database/init_db.py
"""

import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("ERROR: psycopg2 is not installed. Run: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/restaurant_menu",
)

SCRIPT_DIR = Path(__file__).parent
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE   = SCRIPT_DIR / "seed.sql"


def read_sql_file(path: Path) -> str:
    """Read and return the contents of a SQL file."""
    if not path.exists():
        print(f"ERROR: SQL file not found: {path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def run_sql(cursor, label: str, sql_text: str) -> None:
    """Execute a SQL script and print a status message."""
    print(f"  → Running {label} …", end=" ", flush=True)
    cursor.execute(sql_text)
    print("done.")


def main() -> None:
    print("=" * 60)
    print("Restaurant Menu DB Initialiser")
    print("=" * 60)
    print(f"Connecting to: {DATABASE_URL}")

    try:
        conn = psycopg2.connect(DATABASE_URL)
    except psycopg2.OperationalError as exc:
        print(f"\nERROR: Could not connect to the database.\n{exc}", file=sys.stderr)
        sys.exit(1)

    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            schema_sql = read_sql_file(SCHEMA_FILE)
            seed_sql   = read_sql_file(SEED_FILE)

            run_sql(cur, "schema.sql", schema_sql)
            run_sql(cur, "seed.sql",   seed_sql)

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