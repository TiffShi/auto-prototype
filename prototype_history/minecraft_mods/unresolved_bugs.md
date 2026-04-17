# Unresolved Bugs Report

## Final QA Feedback:
VERDICT: FAIL

BACKEND ISSUES:
The Docker build is failing because the build context does not contain a `backend/` directory at the path the Dockerfile expects. The error is:
```
COPY failed: file not found in build context or excluded by .dockerignore: stat backend/: file does not exist
```
This indicates the Dockerfile (likely a combined/root-level Dockerfile or the frontend Dockerfile) is trying to `COPY backend/` but the build context is set to the `frontend/` subdirectory (or vice versa), so the `backend/` folder is not visible.

The root cause is a mismatch between the Docker build context and the COPY paths in the Dockerfile. The `docker-compose.yml` must be setting the build context to `./frontend` (or the individual service directory) while the Dockerfile inside it references `backend/` which is outside that context.

**Fix instructions:**

1. Ensure `docker-compose.yml` sets the correct build context for each service. Each service's build context should be its own directory:
   ```yaml
   services:
     backend:
       build:
         context: ./backend
         dockerfile: Dockerfile
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
   ```

2. Verify the `backend/Dockerfile` only COPYs files relative to the `backend/` directory (which it does — `COPY requirements.txt ./` and `COPY . .` — this is correct as long as the context is `./backend`).

3. Verify the `frontend/Dockerfile` only COPYs files relative to the `frontend/` directory (which it does — `COPY package.json ./` and `COPY . .` — correct as long as context is `./frontend`).

4. The `docker-compose.yml` file was not provided in the plan but is referenced. Generate it with the correct per-service build contexts as shown above, plus the `db` service and environment variables:
   ```yaml
   version: '3.9'
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: mod_conflicts_db
       volumes:
         - ./database/schema.sql:/docker-entrypoint-initdb.d/01_schema.sql
         - ./database/seed.sql:/docker-entrypoint-initdb.d/02_seed.sql
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 5s
         timeout: 5s
         retries: 10

     backend:
       build:
         context: ./backend
         dockerfile: Dockerfile
       ports:
         - "8080:8080"
       environment:
         DATABASE_URL: postgresql://postgres:postgres@db:5432/mod_conflicts_db
       depends_on:
         db:
           condition: service_healthy

     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       ports:
         - "5173:5173"
       depends_on:
         - backend
   ```

FRONTEND ISSUES:
None

DATABASE ISSUES:
None (schema and seed SQL files are well-formed; the `docker-compose.yml` fix above mounts them into `docker-entrypoint-initdb.d/` so Postgres will auto-initialize the DB without needing `init_db.py` to run separately).

BUCKET ISSUES:
None (no MinIO/bucket usage in this project).
