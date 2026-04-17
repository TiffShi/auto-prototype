#!/bin/bash
set -e

echo "============================================"
echo "  Starting Instagram Clone Application"
echo "============================================"

# ── Create required directories ──────────────────────────
mkdir -p /app/backend/uploads

# ── Start Spring Boot Backend (Port 8080) ────────────────
echo "[Backend] Starting Spring Boot on port 8080..."
cd /app/backend

java \
  -Dserver.port=8080 \
  -Dspring.datasource.url=jdbc:h2:mem:instagramdb \
  -Dspring.datasource.driver-class-name=org.h2.Driver \
  -Dspring.jpa.hibernate.ddl-auto=create-drop \
  -Dfile.upload-dir=/app/backend/uploads \
  -jar app.jar &

BACKEND_PID=$!
echo "[Backend] Started with PID $BACKEND_PID"

# ── Wait for backend to be ready ─────────────────────────
echo "[Backend] Waiting for Spring Boot to be ready..."
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1 || \
      curl -sf http://localhost:8080/api/auth/login > /dev/null 2>&1 || \
      [ $WAITED -ge $MAX_WAIT ]; do
  sleep 2
  WAITED=$((WAITED + 2))
  echo "[Backend] Still waiting... (${WAITED}s / ${MAX_WAIT}s)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "[Backend] WARNING: Backend may not be fully ready, proceeding anyway..."
else
  echo "[Backend] Backend is ready!"
fi

# ── Start Vue/Vite Frontend (Port 5173) ──────────────────
echo "[Frontend] Starting Vite dev server on port 5173..."
cd /app/frontend

npm run dev -- --host 0.0.0.0 --port 5173 &

FRONTEND_PID=$!
echo "[Frontend] Started with PID $FRONTEND_PID"

# ── Summary ──────────────────────────────────────────────
echo "============================================"
echo "  All services started!"
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:5173"
echo "============================================"

# ── Keep container alive ─────────────────────────────────
# Monitor both processes; exit if either dies
wait $BACKEND_PID $FRONTEND_PID