#!/usr/bin/env python3
"""
Hospital Simulator — Database Initialisation Script
Reads DATABASE_URL from the environment, connects via psycopg2,
then runs schema.sql followed by seed.sql idempotently.
"""

import os
import sys
import time
import pathlib

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 is not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

# ── Configuration ────────────────────────────────────────────────────────────

DATABASE_URL: str = os.environ.get(
    "DATABASE_URL",
    "postgresql://admin:secret@localhost:5432/hospital_sim",
)

# Strip asyncpg prefix if present (this script uses the sync driver)
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)

SCRIPT_DIR = pathlib.Path(__file__).parent
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE   = SCRIPT_DIR / "seed.sql"

MAX_RETRIES   = 10
RETRY_DELAY_S = 3


# ── Helpers ──────────────────────────────────────────────────────────────────

def wait_for_db(dsn: str) -> psycopg2.extensions.connection:
    """Retry connecting until the database is ready."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            conn = psycopg2.connect(dsn)
            conn.autocommit = False
            print(f"[init_db] Connected to database (attempt {attempt}).")
            return conn
        except psycopg2.OperationalError as exc:
            print(f"[init_db] Database not ready (attempt {attempt}/{MAX_RETRIES}): {exc}")
            if attempt == MAX_RETRIES:
                print("[init_db] FATAL: Could not connect to the database. Aborting.")
                sys.exit(1)
            time.sleep(RETRY_DELAY_S)


def run_sql_file(conn: psycopg2.extensions.connection, filepath: pathlib.Path) -> None:
    """Execute a SQL file inside a single transaction."""
    if not filepath.exists():
        print(f"[init_db] WARNING: SQL file not found: {filepath}")
        return

    sql = filepath.read_text(encoding="utf-8")
    print(f"[init_db] Running {filepath.name} …")
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    print(f"[init_db] {filepath.name} completed successfully.")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"[init_db] Target database: {DATABASE_URL}")

    conn = wait_for_db(DATABASE_URL)

    try:
        run_sql_file(conn, SCHEMA_FILE)
        run_sql_file(conn, SEED_FILE)
        print("[init_db] Database initialisation complete.")
    except Exception as exc:
        conn.rollback()
        print(f"[init_db] ERROR during initialisation: {exc}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()