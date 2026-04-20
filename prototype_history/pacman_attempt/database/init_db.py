#!/usr/bin/env python3
"""
database/init_db.py
-------------------
Standalone database initialisation script for the Pac-Man Leaderboard.

Usage:
    DATABASE_URL=postgresql://pacman:pacman@localhost:5432/pacman python database/init_db.py

Reads DATABASE_URL from the environment, connects via psycopg2,
then executes schema.sql followed by seed.sql idempotently.
"""

import os
import sys
from pathlib import Path

import psycopg2
from psycopg2 import sql

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://pacman:pacman@localhost:5432/pacman",
)

SCRIPT_DIR = Path(__file__).parent
SCHEMA_FILE = SCRIPT_DIR / "schema.sql"
SEED_FILE = SCRIPT_DIR / "seed.sql"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def parse_dsn(url: str) -> dict:
    """
    Convert a postgresql://user:pass@host:port/dbname URL into a psycopg2
    connection keyword-argument dictionary.
    """
    # Strip scheme
    url = url.strip()
    if url.startswith("postgresql://"):
        url = url[len("postgresql://"):]
    elif url.startswith("postgres://"):
        url = url[len("postgres://"):]
    else:
        raise ValueError(f"Unsupported DATABASE_URL scheme: {url}")

    # user:pass@host:port/dbname
    userinfo, hostinfo = url.split("@", 1)
    user, password = userinfo.split(":", 1)

    if "/" in hostinfo:
        hostport, dbname = hostinfo.split("/", 1)
    else:
        hostport = hostinfo
        dbname = "pacman"

    if ":" in hostport:
        host, port_str = hostport.split(":", 1)
        port = int(port_str)
    else:
        host = hostport
        port = 5432

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "dbname": dbname,
    }


def run_sql_file(cursor, filepath: Path) -> None:
    """Read a SQL file and execute it via the given cursor."""
    print(f"  → Executing {filepath.name} …", end=" ")
    content = filepath.read_text(encoding="utf-8")
    cursor.execute(content)
    print("done.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    print("=" * 60)
    print("Pac-Man Leaderboard — Database Initialisation")
    print("=" * 60)
    print(f"DATABASE_URL : {DATABASE_URL}")
    print()

    # Validate SQL files exist
    for f in (SCHEMA_FILE, SEED_FILE):
        if not f.exists():
            print(f"ERROR: Required file not found: {f}", file=sys.stderr)
            sys.exit(1)

    # Parse connection parameters
    try:
        conn_params = parse_dsn(DATABASE_URL)
    except Exception as exc:
        print(f"ERROR: Could not parse DATABASE_URL — {exc}", file=sys.stderr)
        sys.exit(1)

    # Connect
    print("Connecting to PostgreSQL …", end=" ")
    try:
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = False          # explicit transaction control
        print("connected.")
    except psycopg2.OperationalError as exc:
        print(f"\nERROR: Connection failed — {exc}", file=sys.stderr)
        sys.exit(1)

    # Execute schema + seed inside a single transaction
    try:
        with conn.cursor() as cur:
            print("\nRunning SQL files:")
            run_sql_file(cur, SCHEMA_FILE)
            run_sql_file(cur, SEED_FILE)
        conn.commit()
        print("\nAll SQL files executed and committed successfully.")
    except Exception as exc:
        conn.rollback()
        print(f"\nERROR: Execution failed — {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()

    print("\nDatabase initialisation complete. ✓")
    print("=" * 60)


if __name__ == "__main__":
    main()