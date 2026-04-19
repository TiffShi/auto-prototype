#!/bin/bash

# Create uploads directory if it doesn't exist
mkdir -p /app/backend/uploads/drawings

# Start the backend Express server on port 8080
cd /app/backend && node server.js &

# Wait a moment for backend to initialize before starting frontend
sleep 2

# Start the frontend Vite dev server on port 5173
cd /app/frontend && npm run dev &

# Keep container alive by waiting for all background processes
wait