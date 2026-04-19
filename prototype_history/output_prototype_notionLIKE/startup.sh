#!/bin/bash

# Start backend on port 8080
cd /app/backend
node server.js &

# Start frontend on port 5173
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &

# Wait for all background processes
wait