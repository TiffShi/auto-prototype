#!/usr/bin/env python3
"""
bucket/init_bucket.py
---------------------
Idempotently creates the MinIO bucket(s) required by the
Restaurant Menu Management application and sets the correct
access policy.

Bucket: menu-images  →  public-read
  (The backend stores public URLs in items.image_url and the
   frontend displays images directly, so public-read is correct.)

Environment variables:
  MINIO_ROOT_USER      — MinIO access key  (default: minioadmin)
  MINIO_ROOT_PASSWORD  — MinIO secret key  (default: minioadmin)
  MINIO_ENDPOINT       — host:port         (default: localhost:9000)
"""

import json
import os
import sys

try:
    from minio import Minio
    from minio.error import S3Error
except ImportError:
    print("ERROR: minio package not installed. Run: pip install minio", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ROOT_USER = os.environ.get("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = os.environ.get("MINIO_ROOT_PASSWORD", "minioadmin")

# Buckets to create: { bucket_name: public_read (bool) }
BUCKETS: dict[str, bool] = {
    "menu-images": True,   # Item photos — displayed directly by the frontend
}


def public_read_policy(bucket_name: str) -> str:
    """Return a JSON string for an S3-compatible public-read bucket policy."""
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
            }
        ],
    }
    return json.dumps(policy)


def main() -> None:
    print("=" * 60)
    print("MinIO Bucket Initialiser — Restaurant Menu Management")
    print("=" * 60)
    print(f"Endpoint : {MINIO_ENDPOINT}")
    print(f"User     : {MINIO_ROOT_USER}")
    print()

    client = Minio(
        endpoint=MINIO_ENDPOINT,
        access_key=MINIO_ROOT_USER,
        secret_key=MINIO_ROOT_PASSWORD,
        secure=False,
    )

    for bucket_name, is_public in BUCKETS.items():
        try:
            # ── Create bucket if it does not exist ──────────────────────────
            if client.bucket_exists(bucket_name):
                print(f"  [✓] Bucket '{bucket_name}' already exists — skipping creation.")
            else:
                client.make_bucket(bucket_name)
                print(f"  [+] Bucket '{bucket_name}' created.")

            # ── Apply access policy ─────────────────────────────────────────
            if is_public:
                client.set_bucket_policy(bucket_name, public_read_policy(bucket_name))
                print(f"  [✓] Public-read policy applied to '{bucket_name}'.")
            else:
                # Remove any existing policy → private (default)
                try:
                    client.delete_bucket_policy(bucket_name)
                except S3Error:
                    pass  # No policy to remove — already private
                print(f"  [✓] Bucket '{bucket_name}' set to private.")

        except S3Error as exc:
            print(f"  [✗] S3Error for bucket '{bucket_name}': {exc}", file=sys.stderr)
            sys.exit(1)

    print()
    print("✓ MinIO bucket initialisation complete.")


if __name__ == "__main__":
    main()