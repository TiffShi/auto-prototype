# Use Node 18 on Debian Bullseye as base (supports both Node and Python installation)
FROM node:18-bullseye

# Install Python 3, pip, ffmpeg, and other system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure python3 and pip3 are accessible as python/pip
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

# Set working directory
WORKDIR /app

# ─── Backend Setup ───────────────────────────────────────────────────────────
COPY backend/ /app/backend/

# Create HLS output directory
RUN mkdir -p /app/backend/hls_output

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# ─── Frontend Setup ───────────────────────────────────────────────────────────
COPY frontend/ /app/frontend/

# Install Node dependencies
WORKDIR /app/frontend
RUN npm install

# Return to app root
WORKDIR /app

# ─── Expose Ports ─────────────────────────────────────────────────────────────
EXPOSE 8080 5173

# ─── Startup ──────────────────────────────────────────────────────────────────
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]