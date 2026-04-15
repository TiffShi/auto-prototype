FROM node:18-bullseye

# Install Python, pip, and system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Ensure python3 and pip3 are accessible
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

# Set working directory
WORKDIR /app

# Copy backend and install Python dependencies
COPY backend/ ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend and install Node dependencies
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install

# Return to app root
WORKDIR /app

# Create required upload directories
RUN mkdir -p backend/uploads/videos backend/uploads/thumbnails

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose ports for backend and frontend
EXPOSE 8080 5173

CMD ["./startup.sh"]