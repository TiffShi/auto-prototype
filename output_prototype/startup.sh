#!/bin/bash

set -e

echo "========================================="
echo "Starting Prime Visualizer Application"
echo "========================================="

# Start Spring Boot backend on port 8080
echo "[Backend] Starting Spring Boot on port 8080..."
java -jar /app/backend/app.jar --server.port=8080 &
BACKEND_PID=$!
echo "[Backend] Started with PID: $BACKEND_PID"

# Wait for backend to be ready before starting frontend
echo "[Backend] Waiting for backend to become healthy..."
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:8080/api/primes?limit=10 > /dev/null 2>&1; do
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "[Backend] WARNING: Backend did not respond within ${MAX_WAIT}s, starting frontend anyway..."
        break
    fi
    echo "[Backend] Not ready yet, waiting... (${WAITED}s elapsed)"
    sleep 3
    WAITED=$((WAITED + 3))
done
echo "[Backend] Backend is ready!"

# Start Vite frontend dev server on port 5173
echo "[Frontend] Starting Vite dev server on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!
echo "[Frontend] Started with PID: $FRONTEND_PID"

echo "========================================="
echo "Both services are running:"
echo "  Backend  -> http://localhost:8080"
echo "  Frontend -> http://localhost:5173"
echo "========================================="

# Monitor both processes and exit if either dies
wait $BACKEND_PID $FRONTEND_PID