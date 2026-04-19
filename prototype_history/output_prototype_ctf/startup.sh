#!/bin/bash

# Start the Express backend on port 8080
cd /app/backend
node server.js &

# Start the React/Vite frontend on port 5173
cd /app/frontend
npm run dev &

# Keep the container alive by waiting for all background processes
wait