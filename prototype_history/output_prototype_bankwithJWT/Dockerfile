FROM node:18-bullseye

# Install global Angular CLI
RUN npm install -g @angular/cli@17

# Set working directory
WORKDIR /app

# Copy backend and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy frontend and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy all source files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose ports
EXPOSE 8080 5173

# Copy startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]