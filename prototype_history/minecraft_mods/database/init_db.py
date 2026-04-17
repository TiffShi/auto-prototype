#!/usr/bin/env python3
"""
init_db.py — Initialise the Minecraft Mod Conflict Tracker PostgreSQL database.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mod_conflicts_db \
        python database/init_db.py

Reads DATABASE_URL from the environment, connects via psycopg2, then runs
schema.sql followed by seed.sql idempotently.
"""

import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2 import sql as pg_sql
except ImportError:
    print("ERROR: psycopg2 is not installed. Run: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

# ── Configuration ──────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/mod_conflicts_db",
)

SCRIPT_DIR = Path(__file__).parent
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE   = SCRIPT_DIR / "seed.sql"


# ── Helpers ────────────────────────────────────────────────────────────────────

def read_sql(path: Path) -> str:
    if not path.exists():
        print(f"ERROR: SQL file not found: {path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def connect(url: str):
    """
    Parse a postgresql:// URL and return a psycopg2 connection.
    Supports both 'postgresql://' and 'postgres://' schemes.
    """
    # psycopg2 accepts the DSN string directly
    try:
        conn = psycopg2.connect(url)
        conn.autocommit = True          # DDL statements need autocommit
        return conn
    except psycopg2.OperationalError as exc:
        print(f"ERROR: Could not connect to database.\n  URL : {url}\n  Reason: {exc}", file=sys.stderr)
        sys.exit(1)


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"[init_db] Connecting to: {DATABASE_URL}")
    conn = connect(DATABASE_URL)
    cursor = conn.cursor()

    # ── Run schema.sql ─────────────────────────────────────────────────────────
    print(f"[init_db] Applying schema from: {SCHEMA_FILE}")
    schema_sql = read_sql(SCHEMA_FILE)
    try:
        cursor.execute(schema_sql)
        print("[init_db] ✅ Schema applied successfully.")
    except psycopg2.Error as exc:
        print(f"ERROR: Failed to apply schema.\n  {exc}", file=sys.stderr)
        cursor.close()
        conn.close()
        sys.exit(1)

    # ── Run seed.sql ───────────────────────────────────────────────────────────
    print(f"[init_db] Seeding data from: {SEED_FILE}")
    seed_sql = read_sql(SEED_FILE)
    try:
        cursor.execute(seed_sql)
        print("[init_db] ✅ Seed data inserted (duplicates skipped).")
    except psycopg2.Error as exc:
        print(f"ERROR: Failed to insert seed data.\n  {exc}", file=sys.stderr)
        cursor.close()
        conn.close()
        sys.exit(1)

    cursor.close()
    conn.close()
    print("[init_db] 🎉 Database initialisation complete.")


if __name__ == "__main__":
    main()