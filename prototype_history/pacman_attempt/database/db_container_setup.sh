#!/usr/bin/env bash
# =============================================================================
# database/db_container_setup.sh
#
# Initialises a PostgreSQL 15 instance inside a Debian/Ubuntu container.
# Must be run as root.
#
# Steps:
#   1. Install PostgreSQL 15
#   2. Initialise the data directory
#   3. Start the PostgreSQL service
#   4. Create the 'pacman' role and 'pacman' database
#   5. Run schema.sql and seed.sql
#
# Usage (inside container):
#   bash /database/db_container_setup.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PG_VERSION="15"
DB_USER="pacman"
DB_PASS="pacman"
DB_NAME="pacman"
DB_PORT="5432"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/schema.sql"
SEED_FILE="${SCRIPT_DIR}/seed.sql"

export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# 1. Install PostgreSQL 15
# ---------------------------------------------------------------------------
echo "==> [1/5] Installing PostgreSQL ${PG_VERSION} …"
apt-get update -qq
apt-get install -y --no-install-recommends \
    gnupg2 \
    curl \
    ca-certificates \
    lsb-release

# Add the official PostgreSQL APT repository
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg

echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list

apt-get update -qq
apt-get install -y --no-install-recommends \
    "postgresql-${PG_VERSION}" \
    "postgresql-client-${PG_VERSION}" \
    python3 \
    python3-pip \
    python3-psycopg2

echo "    PostgreSQL ${PG_VERSION} installed."

# ---------------------------------------------------------------------------
# 2. Initialise data directory (already done by the package post-install,
#    but we ensure the cluster exists)
# ---------------------------------------------------------------------------
echo "==> [2/5] Ensuring PostgreSQL cluster is initialised …"
PG_CLUSTER_STATUS=$(pg_lsclusters --no-header 2>/dev/null | awk '{print $4}' | head -1 || true)

if [[ "${PG_CLUSTER_STATUS}" != "online" ]]; then
    pg_createcluster "${PG_VERSION}" main --start || true
fi
echo "    Cluster ready."

# ---------------------------------------------------------------------------
# 3. Start PostgreSQL service
# ---------------------------------------------------------------------------
echo "==> [3/5] Starting PostgreSQL service …"
service postgresql start

# Wait until PostgreSQL is accepting connections
MAX_WAIT=30
WAITED=0
until pg_isready -h localhost -p "${DB_PORT}" -q; do
    if [[ ${WAITED} -ge ${MAX_WAIT} ]]; then
        echo "ERROR: PostgreSQL did not become ready within ${MAX_WAIT}s." >&2
        exit 1
    fi
    echo "    Waiting for PostgreSQL … (${WAITED}s)"
    sleep 1
    WAITED=$((WAITED + 1))
done
echo "    PostgreSQL is ready."

# ---------------------------------------------------------------------------
# 4. Create role and database (idempotent)
# ---------------------------------------------------------------------------
echo "==> [4/5] Creating role '${DB_USER}' and database '${DB_NAME}' …"

# Create role if it does not exist
su -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'\" | grep -q 1 || \
       psql -c \"CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}'\"" postgres

# Create database if it does not exist
su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -q 1 || \
       psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}\"" postgres

# Grant all privileges
su -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER}\"" postgres

echo "    Role and database ready."

# ---------------------------------------------------------------------------
# 5. Run schema.sql and seed.sql
# ---------------------------------------------------------------------------
echo "==> [5/5] Applying schema and seed data …"

PGPASSWORD="${DB_PASS}" psql \
    -h localhost \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -f "${SCHEMA_FILE}"
echo "    schema.sql applied."

PGPASSWORD="${DB_PASS}" psql \
    -h localhost \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -f "${SEED_FILE}"
echo "    seed.sql applied."

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
echo " Database initialisation complete!"
echo "  Host     : localhost:${DB_PORT}"
echo "  Database : ${DB_NAME}"
echo "  User     : ${DB_USER}"
echo "  Password : ${DB_PASS}"
echo "  DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"
echo "============================================================"