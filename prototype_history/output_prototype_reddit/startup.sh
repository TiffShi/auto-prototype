#!/bin/bash

# Start FastAPI backend on port 8080
echo "Starting FastAPI backend on port 8080..."
cd /app/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!

# Wait briefly to let backend initialize
sleep 2

# Start Vue/Vite frontend on port 5173
echo "Starting Vue frontend on port 5173..."
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Both services started. Backend on :8080, Frontend on :5173"

# Keep container alive by waiting for both processes
wait $BACKEND_PID $FRONTEND_PID