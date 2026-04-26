#!/usr/bin/env python3
"""
Kanban App — Database Initialisation Script
Reads DATABASE_URL from the environment, then runs schema.sql and seed.sql
idempotently against a PostgreSQL 15 instance.

Usage:
    DATABASE_URL=postgresql://kanban:kanban@localhost:5432/kanbandb python database/init_db.py
"""

import os
import sys
from pathlib import Path

import psycopg2
from psycopg2 import sql


# ── Resolve file paths ────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE = SCRIPT_DIR / "seed.sql"


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        print(
            "ERROR: DATABASE_URL environment variable is not set.\n"
            "Example: postgresql://kanban:kanban@localhost:5432/kanbandb",
            file=sys.stderr,
        )
        sys.exit(1)
    return url


def read_sql_file(path: Path) -> str:
    if not path.exists():
        print(f"ERROR: SQL file not found: {path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def run_sql(conn, label: str, sql_text: str) -> None:
    print(f"  → Running {label} …", end=" ", flush=True)
    with conn.cursor() as cur:
        cur.execute(sql_text)
    conn.commit()
    print("done.")


def main() -> None:
    database_url = get_database_url()

    schema_sql = read_sql_file(SCHEMA_FILE)
    seed_sql = read_sql_file(SEED_FILE)

    print(f"Connecting to database …")
    try:
        # psycopg2 accepts the standard libpq connection string / DSN URL
        conn = psycopg2.connect(database_url)
    except psycopg2.OperationalError as exc:
        print(f"ERROR: Could not connect to the database.\n{exc}", file=sys.stderr)
        sys.exit(1)

    try:
        print("Initialising database schema and seed data …")
        run_sql(conn, "schema.sql", schema_sql)
        run_sql(conn, "seed.sql", seed_sql)
        print("\n✓ Database initialised successfully.")
    except psycopg2.Error as exc:
        conn.rollback()
        print(f"\nERROR: SQL execution failed.\n{exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()