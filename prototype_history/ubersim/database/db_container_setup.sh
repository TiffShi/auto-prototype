#!/usr/bin/env bash
# =============================================================================
# database/db_container_setup.sh
#
# Initialises and starts PostgreSQL inside a Debian/Ubuntu container (root).
# Installs PostgreSQL 15, creates the rideshare database + user, then applies
# schema.sql and seed.sql via the Python init script.
#
# Run as root inside the container:
#   bash /database/db_container_setup.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — override via environment variables if needed
# ---------------------------------------------------------------------------
POSTGRES_VERSION="${POSTGRES_VERSION:-15}"
POSTGRES_DB="${POSTGRES_DB:-rideshare}"
POSTGRES_USER="${POSTGRES_USER:-rideshare_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-rideshare_pass}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
PGDATA="${PGDATA:-/var/lib/postgresql/${POSTGRES_VERSION}/main}"

# Path where this script lives (database/ directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo " Ride-Sharing Simulator — PostgreSQL Container Setup"
echo "============================================================"

# ---------------------------------------------------------------------------
# 1. Install PostgreSQL (if not already installed)
# ---------------------------------------------------------------------------
if ! command -v psql &>/dev/null; then
    echo "[1/6] Installing PostgreSQL ${POSTGRES_VERSION}…"
    apt-get update -qq
    apt-get install -y --no-install-recommends \
        postgresql-${POSTGRES_VERSION} \
        postgresql-client-${POSTGRES_VERSION} \
        python3 \
        python3-pip \
        python3-psycopg2 \
        curl \
        ca-certificates \
        gosu
    echo "      PostgreSQL installed."
else
    echo "[1/6] PostgreSQL already installed — skipping."
fi

# ---------------------------------------------------------------------------
# 2. Initialise the data directory
# ---------------------------------------------------------------------------
echo "[2/6] Initialising data directory at ${PGDATA}…"
mkdir -p "${PGDATA}"
chown -R postgres:postgres "$(dirname "${PGDATA}")"

# Initialise cluster only if PG_VERSION file is absent (fresh data dir)
if [ ! -f "${PGDATA}/PG_VERSION" ]; then
    gosu postgres /usr/lib/postgresql/${POSTGRES_VERSION}/bin/initdb \
        --pgdata="${PGDATA}" \
        --auth-local=trust \
        --auth-host=md5 \
        --encoding=UTF8 \
        --locale=en_US.UTF-8
    echo "      Data directory initialised."
else
    echo "      Data directory already initialised — skipping initdb."
fi

# ---------------------------------------------------------------------------
# 3. Configure PostgreSQL to listen on all interfaces
# ---------------------------------------------------------------------------
echo "[3/6] Configuring PostgreSQL…"
PG_CONF="${PGDATA}/postgresql.conf"
PG_HBA="${PGDATA}/pg_hba.conf"

# Allow connections from any host (Docker networking)
grep -qxF "listen_addresses = '*'" "${PG_CONF}" \
    || echo "listen_addresses = '*'" >> "${PG_CONF}"

grep -qxF "port = ${POSTGRES_PORT}" "${PG_CONF}" \
    || echo "port = ${POSTGRES_PORT}" >> "${PG_CONF}"

# Allow password auth from Docker subnet
if ! grep -q "0.0.0.0/0" "${PG_HBA}"; then
    echo "host  all  all  0.0.0.0/0  md5" >> "${PG_HBA}"
fi

# ---------------------------------------------------------------------------
# 4. Start PostgreSQL
# ---------------------------------------------------------------------------
echo "[4/6] Starting PostgreSQL…"
gosu postgres /usr/lib/postgresql/${POSTGRES_VERSION}/bin/pg_ctl \
    -D "${PGDATA}" \
    -l "${PGDATA}/postgresql.log" \
    start

# Wait until PostgreSQL is ready to accept connections
echo "      Waiting for PostgreSQL to become ready…"
for i in $(seq 1 30); do
    if gosu postgres psql -p "${POSTGRES_PORT}" -c "SELECT 1" postgres &>/dev/null; then
        echo "      PostgreSQL is ready (attempt ${i})."
        break
    fi
    sleep 1
done

# ---------------------------------------------------------------------------
# 5. Create database and user
# ---------------------------------------------------------------------------
echo "[5/6] Creating database '${POSTGRES_DB}' and user '${POSTGRES_USER}'…"

gosu postgres psql -p "${POSTGRES_PORT}" -v ON_ERROR_STOP=1 postgres <<-EOSQL
    -- Create role if it does not exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (
            SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_USER}'
        ) THEN
            CREATE ROLE "${POSTGRES_USER}" WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
        END IF;
    END
    \$\$;

    -- Create database if it does not exist
    SELECT 'CREATE DATABASE "${POSTGRES_DB}" OWNER "${POSTGRES_USER}"'
    WHERE NOT EXISTS (
        SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}'
    )\gexec

    -- Grant all privileges
    GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";
EOSQL

echo "      Database and user ready."

# ---------------------------------------------------------------------------
# 6. Run schema + seed via Python init script
# ---------------------------------------------------------------------------
echo "[6/6] Running schema and seed via init_db.py…"

# Install psycopg2 if pip is available and the package is missing
if python3 -c "import psycopg2" &>/dev/null; then
    echo "      psycopg2 already available."
else
    pip3 install --quiet psycopg2-binary
fi

export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}"

python3 "${SCRIPT_DIR}/init_db.py"

echo ""
echo "============================================================"
echo " Setup complete!"
echo " DATABASE_URL=${DATABASE_URL}"
echo "============================================================"