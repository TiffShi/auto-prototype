#!/usr/bin/env bash
# =============================================================================
# database/db_container_setup.sh
#
# Initialises PostgreSQL on a Debian/Ubuntu container (runs as root).
# Steps:
#   1. Install PostgreSQL
#   2. Initialise the data directory and start the server
#   3. Create the application database and user
#   4. Run schema.sql + seed.sql via init_db.py
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — override via environment variables if needed
# ---------------------------------------------------------------------------
DB_NAME="${POSTGRES_DB:-restaurant_menu}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo " Restaurant Menu — PostgreSQL Container Setup"
echo "============================================================"

# ---------------------------------------------------------------------------
# 1. Install PostgreSQL (if not already present)
# ---------------------------------------------------------------------------
if ! command -v psql &>/dev/null; then
    echo "[1/5] Installing PostgreSQL…"
    apt-get update -qq
    apt-get install -y --no-install-recommends \
        postgresql \
        postgresql-client \
        python3 \
        python3-pip \
        python3-psycopg2 2>/dev/null || true
    echo "      PostgreSQL installed."
else
    echo "[1/5] PostgreSQL already installed — skipping."
fi

# ---------------------------------------------------------------------------
# 2. Ensure the postgres system user owns the data directory and start server
# ---------------------------------------------------------------------------
echo "[2/5] Configuring PostgreSQL data directory…"

PG_VERSION=$(pg_lsclusters -h | awk 'NR==1{print $1}' || psql --version | grep -oP '\d+' | head -1)
PG_DATA="/var/lib/postgresql/${PG_VERSION}/main"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"

# Allow password authentication for local connections
if [ -f "$PG_HBA" ]; then
    sed -i "s/^local\s\+all\s\+all\s\+peer/local   all             all                                     md5/" "$PG_HBA" || true
    sed -i "s/^host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+ident/host    all             all             127.0.0.1\/32            md5/" "$PG_HBA" || true
fi

# Ensure server listens on all interfaces
if [ -f "$PG_CONF" ]; then
    sed -i "s/^#listen_addresses\s*=\s*'localhost'/listen_addresses = '*'/" "$PG_CONF" || true
fi

echo "[3/5] Starting PostgreSQL service…"
service postgresql start || pg_ctlcluster "${PG_VERSION}" main start || true

# Wait for PostgreSQL to be ready
MAX_WAIT=30
WAITED=0
until pg_isready -h 127.0.0.1 -p "${DB_PORT}" -U "${DB_USER}" &>/dev/null; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "ERROR: PostgreSQL did not become ready within ${MAX_WAIT}s." >&2
        exit 1
    fi
    echo "      Waiting for PostgreSQL… (${WAITED}s)"
    sleep 2
    WAITED=$((WAITED + 2))
done
echo "      PostgreSQL is ready."

# ---------------------------------------------------------------------------
# 3. Set postgres user password and create application database
# ---------------------------------------------------------------------------
echo "[4/5] Creating database '${DB_NAME}'…"

# Set password for the postgres superuser
su -c "psql -c \"ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';\"" postgres

# Create the database (idempotent)
su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -q 1 || \
       psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\"" postgres

echo "      Database '${DB_NAME}' ready."

# ---------------------------------------------------------------------------
# 4. Run schema + seed via init_db.py
# ---------------------------------------------------------------------------
echo "[5/5] Running schema and seed scripts…"

# Install psycopg2 if the Python package is missing
python3 -c "import psycopg2" 2>/dev/null || pip3 install --quiet psycopg2-binary

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_NAME}"

python3 "${SCRIPT_DIR}/init_db.py"

echo ""
echo "============================================================"
echo " ✓ PostgreSQL setup complete."
echo "   DATABASE_URL=${DATABASE_URL}"
echo "============================================================"