FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN echo '#!/bin/sh\nset -e\necho "Running Alembic migrations..."\nalembic upgrade head\necho "Starting uvicorn..."\nexec uvicorn app.main:app --host 0.0.0.0 --port 8080' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
