#!/bin/bash

# Start the FastAPI backend on port 8080
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8080 &

# Start the static frontend server on port 5173
cd /app/frontend
serve -s . -l 5173 --no-clipboard &

# Wait for all background processes to keep the container alive
wait