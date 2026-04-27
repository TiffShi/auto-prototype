#!/usr/bin/env bash
# =============================================================================
# database/Dockerfile (embedded as a heredoc reference — see database/Dockerfile)
#
# The actual Dockerfile for the database service is:
#
#   FROM postgres:15
#   COPY schema.sql /docker-entrypoint-initdb.d/01_schema.sql
#   COPY seed.sql   /docker-entrypoint-initdb.d/02_seed.sql
#
# =============================================================================

# =============================================================================
# database/db_container_setup.sh
#
# Initialises PostgreSQL inside a Debian/Ubuntu container (runs as root).
#
# Steps:
#   1. Install PostgreSQL 15 from the official apt repository.
#   2. Initialise the data directory and start the server.
#   3. Create the application database and user.
#   4. Run schema.sql then seed.sql via init_db.py.
#
# Environment variables (with defaults):
#   POSTGRES_USER     — superuser name          (default: postgres)
#   POSTGRES_PASSWORD — superuser password      (default: postgres)
#   POSTGRES_DB       — application database    (default: restaurant_db)
#   DATABASE_URL      — full DSN for init_db.py (auto-constructed if unset)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-restaurant_db}"
PG_VERSION="15"
PG_DATA="/var/lib/postgresql/${PG_VERSION}/main"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"

export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> [db_container_setup] Starting PostgreSQL ${PG_VERSION} setup…"

# ---------------------------------------------------------------------------
# 1. Install PostgreSQL
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Installing PostgreSQL ${PG_VERSION}…"

apt-get update -qq
apt-get install -y --no-install-recommends \
    gnupg \
    curl \
    ca-certificates \
    lsb-release \
    python3 \
    python3-pip \
    python3-venv

# Add the official PostgreSQL apt repository
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg

echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list

apt-get update -qq
apt-get install -y --no-install-recommends "postgresql-${PG_VERSION}"

echo "==> [db_container_setup] PostgreSQL ${PG_VERSION} installed."

# ---------------------------------------------------------------------------
# 2. Configure authentication (trust localhost for initial setup)
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Configuring pg_hba.conf…"

# Allow password auth from localhost
cat > "${PG_HBA}" <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             0.0.0.0/0               md5
EOF

# Listen on all interfaces so Docker port mapping works
sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" "${PG_CONF}" || true
grep -q "^listen_addresses" "${PG_CONF}" \
    || echo "listen_addresses = '*'" >> "${PG_CONF}"

# ---------------------------------------------------------------------------
# 3. Start PostgreSQL
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Starting PostgreSQL service…"

service postgresql start

# Wait until the server is accepting connections
MAX_WAIT=30
WAITED=0
until pg_isready -U "${POSTGRES_USER}" -q; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "ERROR: PostgreSQL did not become ready within ${MAX_WAIT}s."
        exit 1
    fi
    echo "  Waiting for PostgreSQL… (${WAITED}s)"
    sleep 2
    WAITED=$((WAITED + 2))
done

echo "==> [db_container_setup] PostgreSQL is ready."

# ---------------------------------------------------------------------------
# 4. Set the postgres superuser password
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Setting superuser password…"
su -c "psql -c \"ALTER USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';\"" postgres

# ---------------------------------------------------------------------------
# 5. Create the application database
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Creating database '${POSTGRES_DB}'…"
su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\" \
    | grep -q 1 || createdb '${POSTGRES_DB}';" postgres

# ---------------------------------------------------------------------------
# 6. Install Python driver and run init_db.py
# ---------------------------------------------------------------------------
echo "==> [db_container_setup] Installing psycopg2-binary…"
pip3 install --quiet psycopg2-binary

echo "==> [db_container_setup] Running init_db.py (schema + seed)…"
python3 "${SCRIPT_DIR}/init_db.py"

echo ""
echo "==> [db_container_setup] ✅  Database setup complete."
echo "    Database : ${POSTGRES_DB}"
echo "    User     : ${POSTGRES_USER}"
echo "    DSN      : ${DATABASE_URL}"