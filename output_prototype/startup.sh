#!/bin/bash

echo "Starting Spring Boot backend on port 8080..."
cd /app/backend
java -jar target/*.jar &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 15

echo "Starting Vue frontend on port 5173..."
cd /app/frontend
npm run dev &
FRONTEND_PID=$!

echo "Both services started."
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"

wait