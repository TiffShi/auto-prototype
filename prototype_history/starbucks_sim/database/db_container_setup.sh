#!/usr/bin/env bash
# =============================================================================
# db_container_setup.sh
#
# Initialises PostgreSQL inside a Debian/Ubuntu container (runs as root).
# Steps:
#   1. Install PostgreSQL 15
#   2. Initialise the data directory
#   3. Start the PostgreSQL server
#   4. Create the application database and user
#   5. Run schema.sql then seed.sql
#
# Environment variables (with defaults):
#   POSTGRES_USER     = user
#   POSTGRES_PASSWORD = pass
#   POSTGRES_DB       = starbucks_db
#   POSTGRES_PORT     = 5432
# =============================================================================

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────────────
POSTGRES_USER="${POSTGRES_USER:-user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-pass}"
POSTGRES_DB="${POSTGRES_DB:-starbucks_db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
PG_VERSION="15"
PG_DATA="/var/lib/postgresql/${PG_VERSION}/main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[db_setup] ── Step 1: Install PostgreSQL ${PG_VERSION} ──────────────────"
apt-get update -qq
apt-get install -y --no-install-recommends \
    postgresql-${PG_VERSION} \
    postgresql-client-${PG_VERSION} \
    python3 \
    python3-pip \
    python3-psycopg2 2>/dev/null || true

# psycopg2-binary as fallback if system package unavailable
python3 -m pip install --quiet psycopg2-binary 2>/dev/null || true

echo "[db_setup] ── Step 2: Configure PostgreSQL ──────────────────────────────"
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

# Allow connections on all interfaces
sed -i "s/^#listen_addresses.*/listen_addresses = '*'/" "${PG_CONF}"
sed -i "s/^port.*/port = ${POSTGRES_PORT}/" "${PG_CONF}"

# Trust local connections; md5 for host connections
cat > "${PG_HBA}" <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                trust
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             0.0.0.0/0               md5
EOF

echo "[db_setup] ── Step 3: Start PostgreSQL ──────────────────────────────────"
service postgresql start

# Wait until PostgreSQL is accepting connections
MAX_WAIT=30
WAITED=0
until pg_isready -h 127.0.0.1 -p "${POSTGRES_PORT}" -U postgres -q; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "[db_setup] ERROR: PostgreSQL did not start within ${MAX_WAIT}s."
        exit 1
    fi
    echo "[db_setup] Waiting for PostgreSQL… (${WAITED}s)"
    sleep 2
    WAITED=$((WAITED + 2))
done
echo "[db_setup] PostgreSQL is ready."

echo "[db_setup] ── Step 4: Create database and user ──────────────────────────"
psql -U postgres -p "${POSTGRES_PORT}" <<SQL
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_USER}'
    ) THEN
        CREATE ROLE "${POSTGRES_USER}" WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${POSTGRES_DB}" OWNER "${POSTGRES_USER}"'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}'
)\gexec

GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";
SQL

echo "[db_setup] ── Step 5: Run schema.sql ────────────────────────────────────"
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    -p "${POSTGRES_PORT}" \
    -h 127.0.0.1 \
    -f "${SCRIPT_DIR}/schema.sql"

echo "[db_setup] ── Step 6: Run seed.sql ──────────────────────────────────────"
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    -p "${POSTGRES_PORT}" \
    -h 127.0.0.1 \
    -f "${SCRIPT_DIR}/seed.sql"

echo "[db_setup] ── Done ──────────────────────────────────────────────────────"
echo "[db_setup] Database '${POSTGRES_DB}' is ready on port ${POSTGRES_PORT}."
echo "[db_setup] User: ${POSTGRES_USER} / Password: ${POSTGRES_PASSWORD}"