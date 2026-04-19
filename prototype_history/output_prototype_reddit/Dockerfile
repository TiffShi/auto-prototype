FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend and frontend source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install backend Python dependencies
RUN pip3 install --no-cache-dir -r backend/requirements.txt

# Install frontend Node dependencies
RUN cd frontend && npm install

# Expose required ports
EXPOSE 8080 5173

# Copy startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]