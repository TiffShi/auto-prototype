# Object Storage Layer — MinIO

## Buckets

| Bucket Name   | Access Policy | Purpose                                      |
|---------------|---------------|----------------------------------------------|
| `menu-images` | **public-read** | Stores menu item photos uploaded by the owner. The backend saves a plain public URL in `menu_items.image_url`; the React frontend renders it directly with `<img src={item.image_url} />`. |

> **Why public-read?**  
> The customer-facing menu (`/public/menu`) must display images without any authentication.
> Making the bucket public-read removes the need to generate short-lived presigned URLs on
> every page load, which simplifies the frontend and reduces backend load.

---

## MinIO Console

| Property | Value |
|----------|-------|
| URL      | <http://localhost:9001> |
| Username | `minioadmin` |
| Password | `minioadmin` |

---

## Environment Variables

The backend (`backend/app/config.py`) reads the following variables:

| Variable              | Default              | Description                                      |
|-----------------------|----------------------|--------------------------------------------------|
| `MINIO_ENDPOINT`      | `localhost:9000`     | MinIO API host:port (use `minio:9000` in Docker) |
| `MINIO_ROOT_USER`     | `minioadmin`         | MinIO access key / root user                     |
| `MINIO_ROOT_PASSWORD` | `minioadmin`         | MinIO secret key / root password                 |
| `MINIO_BUCKET_NAME`   | `menu-images`        | Target bucket for image uploads                  |
| `MINIO_SECURE`        | `false`              | Set `true` if MinIO is behind TLS                |
| `MINIO_PUBLIC_URL`    | `http://localhost:9000` | Base URL prepended to object paths for public links |

Add these to your `.env` file (see `backend/.env.example`).

---

## How Image Upload Works

1. The owner selects a photo in `MenuItemForm.jsx` and submits it.
2. The frontend `POST`s the file to `POST /menu-items/{id}/upload-image`.
3. The backend (`storage_service.upload_image`) uploads the bytes to MinIO and returns: