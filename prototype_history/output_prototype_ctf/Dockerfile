FROM node:18-bullseye

WORKDIR /app

# Copy backend and frontend directories
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy startup script
WORKDIR /app
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

EXPOSE 8080 5173

CMD ["./startup.sh"]