# Object Storage Layer — MinIO

## Buckets

| Bucket Name | Access Policy | Purpose |
|---|---|---|
| `menu-images` | **Public-read** | Stores restaurant menu item photos uploaded by owners. The backend writes the public URL directly into `items.image_url`; the frontend renders images without any signed-URL step. |

---

## MinIO Console

| Property | Value |
|---|---|
| URL | <http://localhost:9001> |
| Login | `minioadmin` |
| Password | `minioadmin` |

---

## Environment Variables

The backend (`backend/.env` / `backend/app/config.py`) must have: