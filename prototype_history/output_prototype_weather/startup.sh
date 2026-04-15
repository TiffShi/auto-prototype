#!/bin/bash
set -e

echo "============================================"
echo "  Starting Weather App"
echo "============================================"

# ── Start Spring Boot Backend ──
echo "[INFO] Starting Spring Boot backend on port 8080..."
cd /app/backend
java -jar app.jar \
  --server.port=8080 \
  &
BACKEND_PID=$!
echo "[INFO] Spring Boot started with PID: $BACKEND_PID"

# ── Wait for backend to be ready ──
echo "[INFO] Waiting for backend to become healthy..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s http://localhost:8080/api/weather > /dev/null 2>&1 || [ $RETRY_COUNT -ge 10 ]; do
  echo "[INFO] Backend not ready yet... retrying ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 3
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "[WARN] Backend health check timed out, proceeding anyway..."
else
  echo "[INFO] Backend is ready!"
fi

# ── Start Angular Frontend Dev Server ──
echo "[INFO] Starting Angular frontend on port 5173..."
cd /app/frontend
npm start \
  &
FRONTEND_PID=$!
echo "[INFO] Angular dev server started with PID: $FRONTEND_PID"

echo "============================================"
echo "  Both services are running:"
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:5173"
echo "============================================"

# ── Keep container alive; exit if either process dies ──
wait $BACKEND_PID $FRONTEND_PID