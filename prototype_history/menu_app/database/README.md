# Database Layer — Restaurant Menu Management

## Dockerfile

The `database/Dockerfile` builds on the official `postgres:15` image and copies the SQL
init scripts into `/docker-entrypoint-initdb.d/` so they run automatically on first start: