# sandbox/Dockerfile
FROM python:3.11-slim

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy dependency files FIRST to leverage Docker caching
COPY output_prototype/backend/requirements.txt ./backend/
COPY output_prototype/frontend/package.json ./frontend/

# 2. Pre-bake dependencies (This makes boot times nearly instant)
RUN cd backend && pip install --no-cache-dir -r requirements.txt
RUN cd frontend && npm install

# 3. Copy the rest of the generated source code
COPY output_prototype/ ./

EXPOSE 8000 3000

CMD ["tail", "-f", "/dev/null"]