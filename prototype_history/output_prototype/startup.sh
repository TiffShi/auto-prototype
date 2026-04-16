#!/bin/bash

# Start the FastAPI backend on port 8080
echo "Starting FastAPI backend on port 8080..."
cd /app/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!

# Start the React/Vite frontend on port 5173
echo "Starting Vite frontend on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for both processes to keep the container alive
wait $BACKEND_PID $FRONTEND_PID