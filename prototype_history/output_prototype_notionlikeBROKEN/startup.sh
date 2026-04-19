#!/bin/bash
set -e

echo "============================================"
echo "  Starting Notion-like App"
echo "============================================"

# ─────────────────────────────────────────────
# Wait for PostgreSQL to be ready (if external)
# ─────────────────────────────────────────────
wait_for_postgres() {
    echo "[startup] Waiting for PostgreSQL to be available..."
    local retries=30
    local count=0
    until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; do
        count=$((count + 1))
        if [ "$count" -ge "$retries" ]; then
            echo "[startup] WARNING: PostgreSQL not reachable after ${retries} attempts. Continuing anyway..."
            break
        fi
        echo "[startup] PostgreSQL not ready yet (attempt $count/$retries). Retrying in 2s..."
        sleep 2
    done
    echo "[startup] PostgreSQL is ready (or timeout reached)."
}

wait_for_postgres

# ─────────────────────────────────────────────
# Start Spring Boot Backend on port 8080
# ─────────────────────────────────────────────
echo "[startup] Starting Spring Boot backend on port 8080..."
cd /app/backend

java \
    -Xms256m \
    -Xmx512m \
    -Dserver.port=8080 \
    -Dspring.datasource.url="${DB_URL:-jdbc:postgresql://localhost:5432/notionapp}" \
    -Dspring.datasource.username="${DB_USER:-postgres}" \
    -Dspring.datasource.password="${DB_PASSWORD:-postgres}" \
    -Dspring.jpa.hibernate.ddl-auto="${DDL_AUTO:-update}" \
    -jar app.jar \
    > /var/log/backend.log 2>&1 &

BACKEND_PID=$!
echo "[startup] Backend started with PID: $BACKEND_PID"

# ─────────────────────────────────────────────
# Wait for backend to be healthy before starting frontend
# ─────────────────────────────────────────────
echo "[startup] Waiting for backend to become healthy..."
BACKEND_RETRIES=30
BACKEND_COUNT=0
until curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1 || \
      curl -sf http://localhost:8080/api/auth/me > /dev/null 2>&1 || \
      [ "$BACKEND_COUNT" -ge "$BACKEND_RETRIES" ]; do
    BACKEND_COUNT=$((BACKEND_COUNT + 1))
    echo "[startup] Backend not ready yet (attempt $BACKEND_COUNT/$BACKEND_RETRIES)..."
    sleep 3
done

if [ "$BACKEND_COUNT" -ge "$BACKEND_RETRIES" ]; then
    echo "[startup] WARNING: Backend health check timed out. Starting frontend anyway..."
else
    echo "[startup] Backend is healthy!"
fi

# ─────────────────────────────────────────────
# Start Vue/Vite Frontend on port 5173
# ─────────────────────────────────────────────
echo "[startup] Starting Vue/Vite frontend on port 5173..."
cd /app/frontend

npm run dev \
    > /var/log/frontend.log 2>&1 &

FRONTEND_PID=$!
echo "[startup] Frontend started with PID: $FRONTEND_PID"

# ─────────────────────────────────────────────
# Tail logs and keep container alive
# ─────────────────────────────────────────────
echo ""
echo "============================================"
echo "  Both services are starting up:"
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:5173"
echo "============================================"
echo ""

# Create log files if they don't exist
mkdir -p /var/log
touch /var/log/backend.log /var/log/frontend.log

# Tail both logs to stdout
tail -f /var/log/backend.log /var/log/frontend.log &
TAIL_PID=$!

# Monitor processes and exit if either dies
monitor_processes() {
    while true; do
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            echo "[startup] ERROR: Backend process (PID $BACKEND_PID) has died!"
            echo "[startup] Last backend logs:"
            tail -50 /var/log/backend.log
            kill "$FRONTEND_PID" 2>/dev/null || true
            kill "$TAIL_PID" 2>/dev/null || true
            exit 1
        fi
        if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            echo "[startup] ERROR: Frontend process (PID $FRONTEND_PID) has died!"
            echo "[startup] Last frontend logs:"
            tail -50 /var/log/frontend.log
            kill "$BACKEND_PID" 2>/dev/null || true
            kill "$TAIL_PID" 2>/dev/null || true
            exit 1
        fi
        sleep 10
    done
}

monitor_processes &
MONITOR_PID=$!

# Wait for all background processes
wait "$BACKEND_PID" "$FRONTEND_PID"