#!/usr/bin/env bash
# =============================================================================
# postgres_setup.sh
# Bootstrap PostgreSQL 15 for the Minecraft Mod Conflict Tracker.
# Intended to run as root inside a Debian/Ubuntu container.
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DB_NAME="${POSTGRES_DB:-mod_conflicts_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[postgres_setup] ▶ Starting PostgreSQL setup for database: ${DB_NAME}"

# ── 1. Install PostgreSQL if not present ──────────────────────────────────────
if ! command -v psql &>/dev/null; then
    echo "[postgres_setup] Installing postgresql-15 ..."
    apt-get update -qq
    apt-get install -y --no-install-recommends postgresql-15 postgresql-client-15
fi

PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
echo "[postgres_setup] PostgreSQL version detected: ${PG_VERSION}"

# ── 2. Initialise data directory ───────────────────────────────────────────────
PG_DATA="/var/lib/postgresql/${PG_VERSION}/main"

if [ ! -f "${PG_DATA}/PG_VERSION" ]; then
    echo "[postgres_setup] Initialising data directory at ${PG_DATA} ..."
    su -c "/usr/lib/postgresql/${PG_VERSION}/bin/initdb -D ${PG_DATA}" postgres
fi

# ── 3. Start PostgreSQL ────────────────────────────────────────────────────────
echo "[postgres_setup] Starting PostgreSQL service ..."
service postgresql start

# Wait until the server is ready to accept connections
MAX_WAIT=30
WAITED=0
until su -c "pg_isready -p ${DB_PORT}" postgres &>/dev/null; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "ERROR: PostgreSQL did not become ready within ${MAX_WAIT}s." >&2
        exit 1
    fi
    echo "[postgres_setup] Waiting for PostgreSQL to be ready ... (${WAITED}s)"
    sleep 1
    WAITED=$((WAITED + 1))
done
echo "[postgres_setup] ✅ PostgreSQL is ready."

# ── 4. Set postgres user password ─────────────────────────────────────────────
echo "[postgres_setup] Setting password for role '${DB_USER}' ..."
su -c "psql -p ${DB_PORT} -c \"ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';\"" postgres

# ── 5. Create database (idempotent) ───────────────────────────────────────────
DB_EXISTS=$(su -c "psql -p ${DB_PORT} -tAc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}';\"" postgres)
if [ "${DB_EXISTS}" != "1" ]; then
    echo "[postgres_setup] Creating database '${DB_NAME}' ..."
    su -c "createdb -p ${DB_PORT} -O ${DB_USER} ${DB_NAME}" postgres
else
    echo "[postgres_setup] Database '${DB_NAME}' already exists — skipping creation."
fi

# ── 6. Apply schema.sql ────────────────────────────────────────────────────────
echo "[postgres_setup] Applying schema from ${SCRIPT_DIR}/schema.sql ..."
su -c "psql -p ${DB_PORT} -d ${DB_NAME} -f '${SCRIPT_DIR}/schema.sql'" postgres
echo "[postgres_setup] ✅ Schema applied."

# ── 7. Apply seed.sql ─────────────────────────────────────────────────────────
echo "[postgres_setup] Seeding data from ${SCRIPT_DIR}/seed.sql ..."
su -c "psql -p ${DB_PORT} -d ${DB_NAME} -f '${SCRIPT_DIR}/seed.sql'" postgres
echo "[postgres_setup] ✅ Seed data inserted."

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo "[postgres_setup] 🎉 Database '${DB_NAME}' is ready."
echo "  Host     : localhost"
echo "  Port     : ${DB_PORT}"
echo "  Database : ${DB_NAME}"
echo "  User     : ${DB_USER}"
echo "  DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"