#!/usr/bin/env bash
# ============================================================
# Hospital Simulator — PostgreSQL Container Setup
# Runs as root on Debian/Ubuntu inside a Docker container.
# ============================================================
set -euo pipefail

# ── Configuration ────────────────────────────────────────────
POSTGRES_VERSION="15"
DB_NAME="${POSTGRES_DB:-hospital_sim}"
DB_USER="${POSTGRES_USER:-admin}"
DB_PASSWORD="${POSTGRES_PASSWORD:-secret}"
DB_PORT="${POSTGRES_PORT:-5432}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/schema.sql"
SEED_FILE="${SCRIPT_DIR}/seed.sql"

# ── 1. Install PostgreSQL ─────────────────────────────────────
echo "[db_setup] Installing PostgreSQL ${POSTGRES_VERSION} …"
apt-get update -qq
apt-get install -y --no-install-recommends \
    postgresql-${POSTGRES_VERSION} \
    postgresql-client-${POSTGRES_VERSION} \
    python3 \
    python3-pip \
    python3-psycopg2 \
    curl \
    ca-certificates

# ── 2. Initialise the data directory ─────────────────────────
DATA_DIR="/var/lib/postgresql/${POSTGRES_VERSION}/main"
PG_CTL="/usr/lib/postgresql/${POSTGRES_VERSION}/bin/pg_ctl"
INITDB="/usr/lib/postgresql/${POSTGRES_VERSION}/bin/initdb"
PSQL="/usr/bin/psql"

if [ ! -f "${DATA_DIR}/PG_VERSION" ]; then
    echo "[db_setup] Initialising data directory at ${DATA_DIR} …"
    mkdir -p "${DATA_DIR}"
    chown -R postgres:postgres "${DATA_DIR}"
    su -c "${INITDB} -D ${DATA_DIR} --encoding=UTF8 --locale=C" postgres
fi

# ── 3. Configure listen address ──────────────────────────────
PG_CONF="${DATA_DIR}/postgresql.conf"
PG_HBA="${DATA_DIR}/pg_hba.conf"

grep -q "^listen_addresses" "${PG_CONF}" \
    && sed -i "s/^listen_addresses.*/listen_addresses = '*'/" "${PG_CONF}" \
    || echo "listen_addresses = '*'" >> "${PG_CONF}"

grep -q "^port" "${PG_CONF}" \
    && sed -i "s/^port.*/port = ${DB_PORT}/" "${PG_CONF}" \
    || echo "port = ${DB_PORT}" >> "${PG_CONF}"

# Allow password auth from any host
cat >> "${PG_HBA}" <<EOF
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
EOF

# ── 4. Start PostgreSQL ───────────────────────────────────────
echo "[db_setup] Starting PostgreSQL …"
chown -R postgres:postgres "${DATA_DIR}"
su -c "${PG_CTL} -D ${DATA_DIR} -l /var/log/postgresql/setup.log start" postgres

# Wait until PostgreSQL is accepting connections
echo "[db_setup] Waiting for PostgreSQL to be ready …"
for i in $(seq 1 20); do
    if su -c "${PSQL} -U postgres -c 'SELECT 1' > /dev/null 2>&1" postgres; then
        echo "[db_setup] PostgreSQL is ready."
        break
    fi
    echo "[db_setup] Attempt ${i}/20 — not ready yet, sleeping 2 s …"
    sleep 2
done

# ── 5. Create role and database ───────────────────────────────
echo "[db_setup] Creating role '${DB_USER}' and database '${DB_NAME}' …"
su -c "${PSQL} -U postgres" postgres <<SQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE "${DB_USER}" WITH LOGIN PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = '${DB_NAME}'
)\gexec
SQL

# ── 6. Run schema and seed ────────────────────────────────────
echo "[db_setup] Applying schema …"
su -c "${PSQL} -U ${DB_USER} -d ${DB_NAME} -f ${SCHEMA_FILE}" postgres

echo "[db_setup] Applying seed data …"
su -c "${PSQL} -U ${DB_USER} -d ${DB_NAME} -f ${SEED_FILE}" postgres

echo "[db_setup] Database setup complete."
echo "[db_setup] Connection string: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"