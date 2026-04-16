#!/bin/bash

# Start the FastAPI backend on port 8080
cd /app/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Start the Vite frontend dev server on port 5173
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

# Wait for both processes to keep the container alive
wait $BACKEND_PID $FRONTEND_PID