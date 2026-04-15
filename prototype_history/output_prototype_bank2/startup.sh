#!/bin/bash

# Start Spring Boot backend on port 8080
echo "Starting Spring Boot backend on port 8080..."
java -jar /app/backend/target/*.jar --server.port=8080 &

# Wait for backend to be ready
echo "Waiting for backend to start..."
until curl -s http://localhost:8080/api/account/balance > /dev/null 2>&1; do
  sleep 2
  echo "Still waiting for backend..."
done
echo "Backend is up!"

# Start Vue frontend on port 5173
echo "Starting Vue frontend on port 5173..."
cd /app/frontend && npm run dev -- --host 0.0.0.0 --port 5173 &

echo "Both services started."
wait