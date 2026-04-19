#!/bin/bash

set -e

echo "Starting backend on port 8080..."
cd /app/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

echo "Waiting for backend to be ready..."
sleep 3

echo "Starting frontend on port 5173..."
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo "Both services are running."
echo "  Backend  -> http://0.0.0.0:8080"
echo "  Frontend -> http://0.0.0.0:5173"

# Monitor processes and exit if either dies
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Backend process died. Exiting..."
        exit 1
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Frontend process died. Exiting..."
        exit 1
    fi
    sleep 5
done

wait