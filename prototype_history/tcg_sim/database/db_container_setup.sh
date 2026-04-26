#!/usr/bin/env bash
# =============================================================================
# db_container_setup.sh
# Installs PostgreSQL on a Debian/Ubuntu container, creates the TCG database,
# and runs schema.sql + seed.sql.
#
# Must be run as root inside a Debian/Ubuntu container.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — override via environment variables if needed
# ---------------------------------------------------------------------------
DB_NAME="${DB_NAME:-tcgdb}"
DB_USER="${DB_USER:-tcguser}"
DB_PASSWORD="${DB_PASSWORD:-tcgpassword}"
DB_PORT="${DB_PORT:-5432}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/schema.sql"
SEED_FILE="${SCRIPT_DIR}/seed.sql"

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"

echo "============================================================"
echo " TCG Database Container Setup"
echo " DB_NAME     : ${DB_NAME}"
echo " DB_USER     : ${DB_USER}"
echo " DB_PORT     : ${DB_PORT}"
echo " DATABASE_URL: ${DATABASE_URL}"
echo "============================================================"

# ---------------------------------------------------------------------------
# 1. Install PostgreSQL
# ---------------------------------------------------------------------------
echo "[setup] Updating apt and installing PostgreSQL..."
apt-get update -qq
apt-get install -y --no-install-recommends \
    postgresql \
    postgresql-client \
    python3 \
    python3-pip \
    python3-psycopg2 \
    sudo

PG_VERSION=$(pg_lsclusters -h | awk '{print $1}' | head -1)
echo "[setup] Detected PostgreSQL version: ${PG_VERSION}"

# ---------------------------------------------------------------------------
# 2. Initialise the data directory and start the service
# ---------------------------------------------------------------------------
echo "[setup] Starting PostgreSQL service..."

# Ensure the cluster is initialised
if ! pg_lsclusters | grep -q "online"; then
    pg_ctlcluster "${PG_VERSION}" main start || true
fi

# Give the server a moment to start
sleep 3

# Verify it's running
pg_ctlcluster "${PG_VERSION}" main status || {
    echo "[setup] Starting cluster manually..."
    pg_ctlcluster "${PG_VERSION}" main start
    sleep 3
}

# ---------------------------------------------------------------------------
# 3. Create database user and database
# ---------------------------------------------------------------------------
echo "[setup] Creating database user '${DB_USER}'..."
sudo -u postgres psql -tc \
    "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" \
    | grep -q 1 || \
    sudo -u postgres psql -c \
    "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"

echo "[setup] Creating database '${DB_NAME}'..."
sudo -u postgres psql -tc \
    "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" \
    | grep -q 1 || \
    sudo -u postgres psql -c \
    "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Grant privileges
sudo -u postgres psql -c \
    "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Allow the user to create types / tables in the public schema (PG 15+)
sudo -u postgres psql -d "${DB_NAME}" -c \
    "GRANT ALL ON SCHEMA public TO ${DB_USER};" || true

# ---------------------------------------------------------------------------
# 4. Run schema.sql
# ---------------------------------------------------------------------------
echo "[setup] Running schema.sql..."
if [[ -f "${SCHEMA_FILE}" ]]; then
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h localhost \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${SCHEMA_FILE}"
    echo "[setup] schema.sql applied successfully."
else
    echo "[setup] WARNING: schema.sql not found at ${SCHEMA_FILE}"
fi

# ---------------------------------------------------------------------------
# 5. Run seed.sql
# ---------------------------------------------------------------------------
echo "[setup] Running seed.sql..."
if [[ -f "${SEED_FILE}" ]]; then
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h localhost \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${SEED_FILE}"
    echo "[setup] seed.sql applied successfully."
else
    echo "[setup] WARNING: seed.sql not found at ${SEED_FILE}"
fi

# ---------------------------------------------------------------------------
# 6. Verify
# ---------------------------------------------------------------------------
echo "[setup] Verifying tables..."
PGPASSWORD="${DB_PASSWORD}" psql \
    -h localhost \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -c "\dt"

echo ""
echo "============================================================"
echo " Setup complete!"
echo " DATABASE_URL=${DATABASE_URL}"
echo " Connect: psql -h localhost -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"
echo "============================================================"