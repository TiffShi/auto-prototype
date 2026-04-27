# Unresolved Bugs Report

## Final QA Feedback:
Looking at the logs, the build succeeded for all images, but the `restaurant_db` container failed its healthcheck, causing the backend (and frontend) to not start due to dependency failures.

The root cause is almost certainly in the `database/Dockerfile` or the `docker-compose.yml` configuration. The database container is marked unhealthy, which means either:
1. The `POSTGRES_DB` environment variable isn't set, so the database `restaurant_db` doesn't get created
2. The healthcheck command references the wrong database name
3. The Dockerfile or init scripts have an issue

Since the logs don't show the actual `docker-compose.yml`, I need to infer the issue. The healthcheck `pg_isready -U postgres -d restaurant_db` will fail if the `POSTGRES_DB` env var isn't passed to the container, because the default postgres image only creates the `postgres` database by default.

VERDICT: FAIL

BACKEND ISSUES:
None (backend never started due to dependency failure)

FRONTEND ISSUES:
None (frontend never started due to dependency failure)

DATABASE ISSUES:
The `restaurant_db` container failed its healthcheck, causing the entire stack to abort. The most likely cause is that the `docker-compose.yml` is missing the `POSTGRES_DB=restaurant_db` environment variable for the database service, so PostgreSQL only creates the default `postgres` database. The healthcheck `pg_isready -U postgres -d restaurant_db` then fails because `restaurant_db` does not exist yet. Additionally, the `database/Dockerfile` must correctly copy the SQL init files into `/docker-entrypoint-initdb.d/`.

Fix for `docker-compose.yml` — database service must include:
```yaml
  database:
    build: ./database
    container_name: restaurant_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: restaurant_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d restaurant_db"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s
```

Fix for `database/Dockerfile` — must be:
```dockerfile
FROM postgres:15
COPY schema.sql /docker-entrypoint-initdb.d/01_schema.sql
COPY seed.sql   /docker-entrypoint-initdb.d/02_seed.sql
```

Fix for `docker-compose.yml` — backend service must have correct env vars and depend on healthy db:
```yaml
  backend:
    build: ./backend
    container_name: restaurant_backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@database:5432/restaurant_db
      JWT_SECRET_KEY: change-me-to-a-very-long-random-secret-key
      JWT_ALGORITHM: HS256
      JWT_ACCESS_TOKEN_EXPIRE_MINUTES: 1440
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
      MINIO_BUCKET_NAME: menu-images
      MINIO_SECURE: "false"
      MINIO_PUBLIC_URL: http://localhost:9000
    ports:
      - "8080:8080"
    depends_on:
      database:
        condition: service_healthy
      minio:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Fix for `docker-compose.yml` — minio service must have a healthcheck:
```yaml
  minio:
    image: minio/minio:latest
    container_name: restaurant_minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s
```

Fix for `docker-compose.yml` — frontend service:
```yaml
  frontend:
    build: ./frontend
    container_name: restaurant_frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8080
```

BUCKET ISSUES:
The minio service also failed its healthcheck (dependency chain failure). Ensure the minio service has a proper healthcheck as shown above, and that `curl` is available in the minio image (it is in the official `minio/minio` image).

DEVOPS ISSUES:
The `docker-compose.yml` is missing or misconfigured. The critical fixes are:
1. Add `POSTGRES_DB: restaurant_db` to the database service environment — without this, the `restaurant_db` database is never created and the healthcheck fails.
2. Add a healthcheck to the minio service so the dependency chain works.
3. Ensure `depends_on` with `condition: service_healthy` is used for backend → database and backend → minio.
4. Remove the obsolete `version` attribute from `docker-compose.yml`.
5. The backend `Dockerfile` must run: `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]`

INTEGRATION ISSUES:
Once the database is properly initialized with `POSTGRES_DB=restaurant_db`, the backend's `DATABASE_URL=postgresql://postgres:postgres@database:5432/restaurant_db` will correctly resolve the `database` service hostname inside the Docker network. No localhost references should be used between containers.
