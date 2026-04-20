#!/usr/bin/env python3
"""
Standalone database initialisation script.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb python database/init_db.py

Reads DATABASE_URL from the environment, connects with psycopg2,
then runs schema.sql followed by seed.sql — both idempotently.
"""

import os
import sys
import pathlib
import time

import psycopg2
from psycopg2 import OperationalError


# ─── Configuration ────────────────────────────────────────────────────────────

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/appdb",
)

SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE   = SCRIPT_DIR / "seed.sql"

MAX_RETRIES = 10
RETRY_DELAY = 3  # seconds


# ─── Helpers ──────────────────────────────────────────────────────────────────

def connect_with_retry(dsn: str) -> psycopg2.extensions.connection:
    """Attempt to connect to PostgreSQL, retrying on failure."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            conn = psycopg2.connect(dsn)
            conn.autocommit = False
            print(f"[init_db] Connected to database (attempt {attempt}).")
            return conn
        except OperationalError as exc:
            print(
                f"[init_db] Connection attempt {attempt}/{MAX_RETRIES} failed: {exc}. "
                f"Retrying in {RETRY_DELAY}s…"
            )
            time.sleep(RETRY_DELAY)

    print("[init_db] ERROR: Could not connect to the database after "
          f"{MAX_RETRIES} attempts. Aborting.")
    sys.exit(1)


def run_sql_file(conn: psycopg2.extensions.connection, filepath: pathlib.Path) -> None:
    """Read a SQL file and execute it inside a single transaction."""
    if not filepath.exists():
        print(f"[init_db] ERROR: SQL file not found: {filepath}")
        sys.exit(1)

    sql = filepath.read_text(encoding="utf-8")
    print(f"[init_db] Running {filepath.name} …")

    with conn.cursor() as cur:
        cur.execute(sql)

    conn.commit()
    print(f"[init_db] {filepath.name} completed successfully.")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"[init_db] Target database: {DATABASE_URL}")

    conn = connect_with_retry(DATABASE_URL)

    try:
        run_sql_file(conn, SCHEMA_FILE)
        run_sql_file(conn, SEED_FILE)
    except Exception as exc:
        conn.rollback()
        print(f"[init_db] ERROR during SQL execution: {exc}")
        sys.exit(1)
    finally:
        conn.close()

    print("[init_db] Database initialisation complete.")


if __name__ == "__main__":
    main()