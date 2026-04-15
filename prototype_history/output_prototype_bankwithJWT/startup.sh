#!/bin/bash

set -e

echo "Starting Banking App..."

# Start backend on port 8080
echo "Starting Express backend on port 8080..."
cd /app/backend
node server.js &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 3

# Start Angular frontend on port 5173
echo "Starting Angular frontend on port 5173..."
cd /app/frontend
ng serve --host 0.0.0.0 --port 5173 --disable-host-check &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo "Both servers are running."
echo "  Backend:  http://localhost:8080"
echo "  Frontend: http://localhost:5173"

# Keep container alive and wait for both processes
wait $BACKEND_PID $FRONTEND_PID