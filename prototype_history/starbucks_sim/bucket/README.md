# Object Storage Layer — MinIO

## Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `drink-images` | **public-read** | Drink menu photos uploaded by admins via the Admin Panel |

The bucket is set to **public-read** so the Vue frontend can display images
directly from presigned URLs returned by the `/api/media/{filename}` endpoint.
The backend also generates 24-hour presigned GET URLs for any object on demand.

---

## MinIO Console

| Item | Value |
|---|---|
| URL | <http://localhost:9001> |
| Username | `minioadmin` |
| Password | `minioadmin` |

---

## Environment Variables

The backend service must have these variables set:

| Variable | Default | Description |
|---|---|---|
| `MINIO_ENDPOINT` | `minio:9000` | MinIO API host:port (use `localhost:9000` for local dev) |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `drink-images` | Target bucket name |
| `MINIO_SECURE` | `false` | Set `true` if MinIO is behind TLS |

---

## Running the Setup Script Manually