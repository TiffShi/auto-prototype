#!/usr/bin/env python3
"""
MinIO bucket initialisation script.

Creates the required bucket(s) for the Starbucks ordering app and sets
an appropriate access policy.

Environment variables:
    MINIO_ROOT_USER      — MinIO access key  (default: minioadmin)
    MINIO_ROOT_PASSWORD  — MinIO secret key  (default: minioadmin)
    MINIO_ENDPOINT       — host:port         (default: localhost:9000)
"""

import json
import os
import sys
import time

from minio import Minio
from minio.error import S3Error

# ─── Configuration ────────────────────────────────────────────────────────────

MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ROOT_USER = os.environ.get("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = os.environ.get("MINIO_ROOT_PASSWORD", "minioadmin")

# Buckets required by the application
# drink-images: stores drink photos uploaded by admins.
# The backend signs URLs (presigned GET), so the bucket itself is private;
# public-read is also acceptable here because the media router proxies via
# presigned URLs anyway — we keep it public-read for simplicity so the
# frontend can display images directly when a full URL is stored.
BUCKETS = [
    {
        "name": "drink-images",
        "public_read": True,   # frontend displays images directly via presigned URL
        "description": "Drink menu images uploaded by admins",
    },
]

MAX_RETRIES = 10
RETRY_DELAY = 3  # seconds


# ─── Helpers ──────────────────────────────────────────────────────────────────

def build_public_read_policy(bucket_name: str) -> str:
    """Return an S3-compatible public-read bucket policy as a JSON string."""
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
            }
        ],
    }
    return json.dumps(policy)


def get_client_with_retry() -> Minio:
    """Connect to MinIO, retrying until the server is ready."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            client = Minio(
                endpoint=MINIO_ENDPOINT,
                access_key=MINIO_ROOT_USER,
                secret_key=MINIO_ROOT_PASSWORD,
                secure=False,
            )
            # Probe the server with a lightweight call
            client.list_buckets()
            print(f"[init_bucket] Connected to MinIO at {MINIO_ENDPOINT} "
                  f"(attempt {attempt}).")
            return client
        except Exception as exc:
            print(
                f"[init_bucket] Attempt {attempt}/{MAX_RETRIES} failed: {exc}. "
                f"Retrying in {RETRY_DELAY}s…"
            )
            time.sleep(RETRY_DELAY)

    print(f"[init_bucket] ERROR: Could not connect to MinIO after "
          f"{MAX_RETRIES} attempts.")
    sys.exit(1)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"[init_bucket] MinIO endpoint : {MINIO_ENDPOINT}")
    print(f"[init_bucket] Access key     : {MINIO_ROOT_USER}")

    client = get_client_with_retry()

    for bucket_cfg in BUCKETS:
        bucket_name: str = bucket_cfg["name"]
        public_read: bool = bucket_cfg["public_read"]

        # ── Idempotent bucket creation ────────────────────────────────────────
        try:
            if client.bucket_exists(bucket_name):
                print(f"[init_bucket] Bucket '{bucket_name}' already exists — skipping creation.")
            else:
                client.make_bucket(bucket_name)
                print(f"[init_bucket] Bucket '{bucket_name}' created.")
        except S3Error as exc:
            print(f"[init_bucket] ERROR creating bucket '{bucket_name}': {exc}")
            sys.exit(1)

        # ── Set access policy ─────────────────────────────────────────────────
        try:
            if public_read:
                policy_json = build_public_read_policy(bucket_name)
                client.set_bucket_policy(bucket_name, policy_json)
                print(f"[init_bucket] Bucket '{bucket_name}' policy set to public-read.")
            else:
                # Remove any existing policy → private (default MinIO behaviour)
                try:
                    client.delete_bucket_policy(bucket_name)
                except S3Error:
                    pass  # No policy to delete — already private
                print(f"[init_bucket] Bucket '{bucket_name}' policy set to private.")
        except S3Error as exc:
            print(f"[init_bucket] WARNING: Could not set policy for '{bucket_name}': {exc}")

    print("[init_bucket] Bucket initialisation complete.")


if __name__ == "__main__":
    main()