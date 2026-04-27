#!/usr/bin/env python3
"""
database/init_db.py
-------------------
Standalone initialisation script for the Restaurant Menu Management database.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant_db \
        python database/init_db.py

The script:
  1. Reads DATABASE_URL from the environment.
  2. Connects to PostgreSQL using psycopg2.
  3. Runs database/schema.sql  (idempotent — uses IF NOT EXISTS / CREATE EXTENSION IF NOT EXISTS).
  4. Runs database/seed.sql    (idempotent — uses INSERT … ON CONFLICT DO NOTHING).

NOTE: When using the official postgres:15 Docker image, schema.sql and seed.sql
are mounted into /docker-entrypoint-initdb.d/ and run automatically on first start.
This script is retained for manual/standalone use outside of Docker.
"""

import os
import sys
import pathlib
import time

import psycopg2
from psycopg2 import OperationalError

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/restaurant_db",
)

SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE = SCRIPT_DIR / "seed.sql"

MAX_RETRIES = 10
RETRY_DELAY_SECONDS = 3


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _connect_with_retry(dsn: str) -> "psycopg2.connection":
    """Attempt to connect to PostgreSQL, retrying on transient failures."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            conn = psycopg2.connect(dsn)
            print(f"[init_db] Connected to database (attempt {attempt}).")
            return conn
        except OperationalError as exc:
            print(
                f"[init_db] Connection attempt {attempt}/{MAX_RETRIES} failed: {exc}. "
                f"Retrying in {RETRY_DELAY_SECONDS}s…"
            )
            if attempt == MAX_RETRIES:
                print("[init_db] Could not connect to the database. Aborting.")
                sys.exit(1)
            time.sleep(RETRY_DELAY_SECONDS)


def _run_sql_file(conn: "psycopg2.connection", filepath: pathlib.Path) -> None:
    """Read and execute a SQL file within a single transaction."""
    if not filepath.exists():
        print(f"[init_db] ERROR: SQL file not found: {filepath}")
        sys.exit(1)

    sql = filepath.read_text(encoding="utf-8")
    print(f"[init_db] Running {filepath.name} …")

    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()

    print(f"[init_db] {filepath.name} completed successfully.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"[init_db] Target database: {DATABASE_URL}")

    conn = _connect_with_retry(DATABASE_URL)

    try:
        # Autocommit OFF — each file runs in its own explicit transaction
        conn.autocommit = False

        _run_sql_file(conn, SCHEMA_FILE)
        _run_sql_file(conn, SEED_FILE)

        print("[init_db] Database initialisation complete.")
    except Exception as exc:
        conn.rollback()
        print(f"[init_db] ERROR during initialisation: {exc}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()