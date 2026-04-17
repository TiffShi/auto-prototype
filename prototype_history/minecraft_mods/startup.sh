#!/bin/bash
set -e

# --- ADD THESE THREE LINES ---
echo "==> Fixing PostgreSQL run directory permissions..."
mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql
# -----------------------------

echo "==> Starting PostgreSQL..."
service postgresql start

echo "==> Waiting for PostgreSQL to be ready..."
sleep 3

echo "==> Creating database and running init scripts..."
# Create the database user and database if they don't exist
su -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='postgres'\" | grep -q 1 || createuser -s postgres" postgres 2>/dev/null || true
su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='mod_conflicts_db'\" | grep -q 1 || createdb mod_conflicts_db" postgres 2>/dev/null || true
su -c "psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\"" postgres 2>/dev/null || true

# Run any setup scripts in the database directory
if ls /app/database/*_setup.sh 2>/dev/null; then
    bash /app/database/*_setup.sh
fi

if ls /app/database/*.sql 2>/dev/null; then
    for f in /app/database/*.sql; do
        echo "==> Running SQL script: $f"
        su -c "psql -d mod_conflicts_db -f $f" postgres
    done
fi

if ls /app/database/init_db.py 2>/dev/null; then
    python /app/database/init_db.py
fi

echo "==> Sleeping 2 seconds to ensure DB is fully ready..."
sleep 2

# Export environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mod_conflicts_db"

echo "==> Starting backend on port 8080..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8080 &

echo "==> Starting frontend on port 5173..."
cd /app/frontend
npm run dev &

echo "==> All services started. Waiting..."
wait