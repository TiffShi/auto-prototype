FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set python3 as default python
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

WORKDIR /app

# Copy backend and install Python dependencies
COPY backend/ ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend and install Node dependencies
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install

WORKDIR /app

# Ensure uploads directory exists
RUN mkdir -p /app/backend/uploads

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

EXPOSE 8080 5173

CMD ["./startup.sh"]