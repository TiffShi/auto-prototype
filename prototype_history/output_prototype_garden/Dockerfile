FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files and install Python dependencies
COPY backend/ ./backend/
RUN pip3 install --no-cache-dir -r backend/requirements.txt

# Copy frontend files and install Node dependencies
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install

# Return to app root
WORKDIR /app

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose required ports
EXPOSE 8080 5173

CMD ["./startup.sh"]