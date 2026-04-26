#!/usr/bin/env bash
# ============================================================
# Kanban App — PostgreSQL 15 Container Setup Script
# Runs as root on Debian/Ubuntu inside a container.
# Installs PostgreSQL 15, creates the kanban role + database,
# then applies schema.sql and seed.sql.
# ============================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DB_USER="kanban"
DB_PASSWORD="kanban"
DB_NAME="kanbandb"
DB_PORT="5432"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"

echo "============================================================"
echo " Kanban App — PostgreSQL 15 Setup"
echo "============================================================"

# ── 1. Install PostgreSQL 15 ──────────────────────────────────────────────────
echo "[1/6] Installing PostgreSQL 15 …"
apt-get update -qq
apt-get install -y --no-install-recommends \
    postgresql-15 \
    postgresql-client-15 \
    python3 \
    python3-pip \
    python3-psycopg2 \
    curl \
    ca-certificates

# ── 2. Initialise data directory ──────────────────────────────────────────────
echo "[2/6] Initialising PostgreSQL data directory …"
PGDATA="/var/lib/postgresql/15/main"
PG_HBA="/etc/postgresql/15/main/pg_hba.conf"
PG_CONF="/etc/postgresql/15/main/postgresql.conf"

# Ensure the cluster is initialised (pg_createcluster may already have done it)
if [ ! -f "${PGDATA}/PG_VERSION" ]; then
    pg_createcluster 15 main --start
fi

# ── 3. Start PostgreSQL ───────────────────────────────────────────────────────
echo "[3/6] Starting PostgreSQL service …"
service postgresql start

# Wait until PostgreSQL is accepting connections
MAX_WAIT=30
WAITED=0
until pg_isready -h localhost -p "${DB_PORT}" -U postgres -q; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "ERROR: PostgreSQL did not start within ${MAX_WAIT} seconds." >&2
        exit 1
    fi
    sleep 1
    WAITED=$((WAITED + 1))
done
echo "   PostgreSQL is ready."

# ── 4. Create role and database ───────────────────────────────────────────────
echo "[4/6] Creating role '${DB_USER}' and database '${DB_NAME}' …"
su -c "psql -v ON_ERROR_STOP=1 <<'EOSQL'
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
    END IF;
END\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
\gexec
EOSQL
" postgres

# Grant privileges
su -c "psql -v ON_ERROR_STOP=1 -d ${DB_NAME} -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};\"" postgres
su -c "psql -v ON_ERROR_STOP=1 -d ${DB_NAME} -c \"GRANT ALL ON SCHEMA public TO ${DB_USER};\"" postgres

# ── 5. Install Python psycopg2 (if not already available via apt) ─────────────
echo "[5/6] Ensuring psycopg2 is available for init_db.py …"
python3 -c "import psycopg2" 2>/dev/null || pip3 install --quiet psycopg2-binary

# ── 6. Run schema + seed via init_db.py ──────────────────────────────────────
echo "[6/6] Applying schema.sql and seed.sql …"
DATABASE_URL="${DATABASE_URL}" python3 "${SCRIPT_DIR}/init_db.py"

echo ""
echo "============================================================"
echo " ✓ Setup complete!"
echo "   Host:     localhost:${DB_PORT}"
echo "   Database: ${DB_NAME}"
echo "   User:     ${DB_USER}"
echo "   Password: ${DB_PASSWORD}"
echo "   DATABASE_URL=${DATABASE_URL}"
echo "============================================================"