FROM node:18-bullseye

WORKDIR /app

# Copy backend and install dependencies
COPY backend/ ./backend/
RUN cd backend && npm install

# Copy frontend and install dependencies
COPY frontend/ ./frontend/
RUN cd frontend && npm install

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

EXPOSE 8080 5173

CMD ["./startup.sh"]