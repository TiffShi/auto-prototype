FROM python:3.11-bullseye

# Install Node.js 18 and PostgreSQL
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    postgresql \
    postgresql-client \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install backend dependencies
COPY backend/ /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy and install frontend dependencies
COPY frontend/ /app/frontend/
RUN cd /app/frontend && npm install

# Copy database layer
COPY database/ /app/database/

# Ensure PostgreSQL data directory is writable
RUN chown -R postgres:postgres /var/lib/postgresql

EXPOSE 8080 5173

COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]