# Object Storage Layer — MinIO

## Buckets

| Bucket Name | Access Policy | Purpose |
|---|---|---|
| `card-images` | **Public-read** | Stores card artwork PNG files. The frontend displays images directly via public URL or presigned URL returned by the backend. |

---

## MinIO Console

| Item | Value |
|---|---|
| URL | [http://localhost:9001](http://localhost:9001) |
| Username | `minioadmin` |
| Password | `minioadmin` |

---

## Environment Variables

The backend (`core/config.py`) reads the following variables:

| Variable | Default | Description |
|---|---|---|
| `MINIO_ENDPOINT` | `minio:9000` | MinIO API host:port (use `localhost:9000` outside Docker) |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `card-images` | Bucket name for card artwork |
| `MINIO_SECURE` | `false` | Set `true` to use HTTPS |

Set these in your `.env` file: