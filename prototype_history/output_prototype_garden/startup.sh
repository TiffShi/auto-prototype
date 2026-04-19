#!/bin/bash

set -e

echo "Starting Blooming Flower Garden..."

# Start FastAPI backend on port 8080
echo "Starting FastAPI backend on port 8080..."
cd /app/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Give backend a moment to initialize
sleep 2

# Start Vite frontend on port 5173
echo "Starting Vite frontend on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo "Both services are running."
echo "  Backend  -> http://localhost:8080"
echo "  Frontend -> http://localhost:5173"

# Wait for both processes to keep container alive
wait $BACKEND_PID $FRONTEND_PID