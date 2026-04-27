#!/usr/bin/env python3
"""
bucket/init_bucket.py
---------------------
Idempotent MinIO bucket initialisation for the Restaurant Menu Management app.

Buckets created:
  - menu-images   (public-read — frontend displays images directly via public URL)

Usage:
    MINIO_ROOT_USER=minioadmin \
    MINIO_ROOT_PASSWORD=minioadmin \
    python bucket/init_bucket.py
"""

import json
import os
import sys
import time

from minio import Minio
from minio.error import S3Error

# ---------------------------------------------------------------------------
# Configuration — read from environment with safe defaults
# ---------------------------------------------------------------------------
MINIO_ENDPOINT: str = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ROOT_USER: str = os.environ.get("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD: str = os.environ.get("MINIO_ROOT_PASSWORD", "minioadmin")
MINIO_SECURE: bool = os.environ.get("MINIO_SECURE", "false").lower() == "true"

# Buckets to provision
BUCKETS: list[dict] = [
    {
        "name": "menu-images",
        # public-read: the backend stores a plain public URL in image_url;
        # the frontend renders it directly without signing.
        "public_read": True,
    }
]

MAX_RETRIES = 10
RETRY_DELAY = 3  # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_public_read_policy(bucket_name: str) -> str:
    """Return a JSON bucket policy that allows anonymous s3:GetObject."""
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


def _get_client() -> Minio:
    """Return a connected MinIO client, retrying on connection errors."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            client = Minio(
                endpoint=MINIO_ENDPOINT,
                access_key=MINIO_ROOT_USER,
                secret_key=MINIO_ROOT_PASSWORD,
                secure=MINIO_SECURE,
            )
            # Probe the server with a lightweight call
            client.list_buckets()
            print(f"[init_bucket] Connected to MinIO at {MINIO_ENDPOINT} (attempt {attempt}).")
            return client
        except Exception as exc:
            print(
                f"[init_bucket] Attempt {attempt}/{MAX_RETRIES} failed: {exc}. "
                f"Retrying in {RETRY_DELAY}s…"
            )
            if attempt == MAX_RETRIES:
                print("[init_bucket] Could not connect to MinIO. Aborting.")
                sys.exit(1)
            time.sleep(RETRY_DELAY)

    # Unreachable, but satisfies type checkers
    sys.exit(1)


def provision_bucket(client: Minio, bucket_cfg: dict) -> None:
    """Create a bucket (if absent) and apply the requested access policy."""
    name: str = bucket_cfg["name"]
    public_read: bool = bucket_cfg.get("public_read", False)

    try:
        if client.bucket_exists(name):
            print(f"[init_bucket] Bucket '{name}' already exists — skipping creation.")
        else:
            client.make_bucket(name)
            print(f"[init_bucket] Bucket '{name}' created.")

        if public_read:
            policy_json = _build_public_read_policy(name)
            client.set_bucket_policy(name, policy_json)
            print(f"[init_bucket] Public-read policy applied to '{name}'.")
        else:
            # Explicitly remove any existing policy → private (default MinIO behaviour)
            try:
                client.delete_bucket_policy(name)
                print(f"[init_bucket] Bucket '{name}' set to private (policy removed).")
            except S3Error:
                # No policy to remove — already private
                pass

    except S3Error as exc:
        print(f"[init_bucket] ERROR provisioning bucket '{name}': {exc}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"[init_bucket] MinIO endpoint : {MINIO_ENDPOINT}")
    print(f"[init_bucket] Buckets        : {[b['name'] for b in BUCKETS]}")

    client = _get_client()

    for bucket_cfg in BUCKETS:
        provision_bucket(client, bucket_cfg)

    print("[init_bucket] ✅  MinIO bucket initialisation complete.")


if __name__ == "__main__":
    main()