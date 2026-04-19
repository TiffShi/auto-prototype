#!/bin/bash
set -e

echo "============================================"
echo "  Local Network Live Streaming App"
echo "============================================"

# ─── Start FastAPI Backend ────────────────────────────────────────────────────
echo "[Backend] Starting FastAPI on port 8080..."
cd /app/backend
python -m uvicorn main:app \
    --host 0.0.0.0 \
    --port 8080 \
    --reload \
    > /var/log/backend.log 2>&1 &
BACKEND_PID=$!
echo "[Backend] Started with PID $BACKEND_PID"

# ─── Wait for Backend to be Ready ────────────────────────────────────────────
echo "[Backend] Waiting for backend to become ready..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf http://localhost:8080/docs > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "[Backend] WARNING: Backend did not respond after $MAX_RETRIES attempts, continuing anyway..."
        break
    fi
    echo "[Backend] Waiting... attempt $RETRY_COUNT/$MAX_RETRIES"
    sleep 2
done
echo "[Backend] Backend is ready!"

# ─── Start Vite Frontend ──────────────────────────────────────────────────────
echo "[Frontend] Starting Vite dev server on port 5173..."
cd /app/frontend
npm run dev \
    > /var/log/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[Frontend] Started with PID $FRONTEND_PID"

# ─── Tail Logs ────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  Services Running:"
echo "  - Backend  (FastAPI): http://0.0.0.0:8080"
echo "  - Frontend (Vite):    http://0.0.0.0:5173"
echo "============================================"
echo ""

# Stream both logs to stdout so Docker logs works
tail -f /var/log/backend.log /var/log/frontend.log &
TAIL_PID=$!

# ─── Monitor Processes ────────────────────────────────────────────────────────
# If either critical process dies, log it
monitor_process() {
    local PID=$1
    local NAME=$2
    wait "$PID"
    echo "[WARN] $NAME process (PID $PID) has exited!"
}

monitor_process $BACKEND_PID "Backend" &
monitor_process $FRONTEND_PID "Frontend" &

# Keep container alive by waiting on all background jobs
wait $BACKEND_PID $FRONTEND_PID
echo "[ERROR] Both servers have stopped. Exiting container."
exit 1