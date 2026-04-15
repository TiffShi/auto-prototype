FROM python:3.11-bullseye

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install backend dependencies
COPY backend/ ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend files
COPY frontend/ ./frontend/

# Install a simple static file server for the frontend
RUN npm install -g serve

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

EXPOSE 8080 5173

CMD ["./startup.sh"]