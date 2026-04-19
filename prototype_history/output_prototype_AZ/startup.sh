#!/bin/bash

set -e

echo "=== Starting A2Z Selects Platform ==="

# Seed the admin user (safe to run multiple times if script handles existing user)
echo ">>> Seeding admin user..."
cd /app/backend
python seed_admin.py || echo "Admin seed skipped or already exists."

# Start the FastAPI backend on port 8080
echo ">>> Starting FastAPI backend on port 8080..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 3

# Start the React/Vite frontend on port 5173
echo ">>> Starting Vite frontend on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "=== Both services started ==="
echo "Backend running at http://localhost:8080"
echo "Frontend running at http://localhost:5173"

# Keep container alive by waiting for all background processes
wait $BACKEND_PID $FRONTEND_PID