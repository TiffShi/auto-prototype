#!/bin/bash

set -e

echo "========================================="
echo "Starting YouTube-Style Video Platform"
echo "========================================="

# Ensure upload directories exist
mkdir -p /app/backend/uploads/videos
mkdir -p /app/backend/uploads/thumbnails

# Start FastAPI backend on port 8080
echo "[Backend] Starting FastAPI on port 8080..."
cd /app/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!
echo "[Backend] Started with PID $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 3

# Start Vite frontend dev server on port 5173
echo "[Frontend] Starting Vite dev server on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!
echo "[Frontend] Started with PID $FRONTEND_PID"

echo "========================================="
echo "Backend  -> http://localhost:8080"
echo "Frontend -> http://localhost:5173"
echo "========================================="

# Monitor processes and exit if either dies
monitor_processes() {
    while true; do
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo "[ERROR] Backend process died unexpectedly!"
            exit 1
        fi
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "[ERROR] Frontend process died unexpectedly!"
            exit 1
        fi
        sleep 5
    done
}

monitor_processes &

# Wait for all background processes
wait