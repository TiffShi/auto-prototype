#!/usr/bin/env python3
"""
init_bucket.py — Initialise MinIO buckets for the Trading Card Game.

Connects to MinIO at localhost:9000 using MINIO_ROOT_USER and
MINIO_ROOT_PASSWORD environment variables, then creates the required
bucket(s) with appropriate access policies.

Idempotent: checks bucket_exists before make_bucket.
"""

import json
import os
import sys
import time

try:
    from minio import Minio
    from minio.error import S3Error
except ImportError:
    print("ERROR: minio SDK not installed. Run: pip install minio")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MINIO_ENDPOINT      = os.environ.get("MINIO_ENDPOINT",      "localhost:9000")
MINIO_ROOT_USER     = os.environ.get("MINIO_ROOT_USER",     "minioadmin")
MINIO_ROOT_PASSWORD = os.environ.get("MINIO_ROOT_PASSWORD", "minioadmin")
MINIO_SECURE        = os.environ.get("MINIO_SECURE",        "false").lower() == "true"

# Buckets to create
# card-images: stores card artwork — public-read so the frontend can display
#              images directly via presigned or public URLs.
BUCKETS: list[dict] = [
    {
        "name":        "card-images",
        "public_read": True,
        "description": "Card artwork images served to the frontend",
    },
]

MAX_RETRIES = 10
RETRY_DELAY = 3  # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def public_read_policy(bucket_name: str) -> str:
    """Return a JSON bucket policy that allows anonymous GET on all objects."""
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect":    "Allow",
                "Principal": {"AWS": ["*"]},
                "Action":    ["s3:GetObject"],
                "Resource":  [f"arn:aws:s3:::{bucket_name}/*"],
            }
        ],
    }
    return json.dumps(policy)


def wait_for_minio(client: Minio) -> None:
    """Poll MinIO until it responds or we exhaust retries."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # list_buckets() is a lightweight health-check call
            client.list_buckets()
            print(f"[init_bucket] MinIO is ready (attempt {attempt}).")
            return
        except Exception as exc:
            print(
                f"[init_bucket] MinIO not ready (attempt {attempt}/{MAX_RETRIES}): {exc}"
            )
            if attempt == MAX_RETRIES:
                print("[init_bucket] FATAL: Could not connect to MinIO.")
                sys.exit(1)
            time.sleep(RETRY_DELAY)


def create_bucket(client: Minio, bucket_cfg: dict) -> None:
    name        = bucket_cfg["name"]
    public_read = bucket_cfg.get("public_read", False)

    try:
        if client.bucket_exists(name):
            print(f"[init_bucket] Bucket '{name}' already exists — skipping creation.")
        else:
            client.make_bucket(name)
            print(f"[init_bucket] Bucket '{name}' created.")

        if public_read:
            policy_json = public_read_policy(name)
            client.set_bucket_policy(name, policy_json)
            print(f"[init_bucket] Public-read policy applied to '{name}'.")
        else:
            # Ensure no accidental public policy (private by default in MinIO)
            try:
                client.delete_bucket_policy(name)
                print(f"[init_bucket] Bucket '{name}' set to private (policy removed).")
            except S3Error:
                pass  # No policy to remove — already private

    except S3Error as exc:
        print(f"[init_bucket] ERROR processing bucket '{name}': {exc}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("============================================================")
    print(" TCG MinIO Bucket Initialisation")
    print(f" Endpoint : {MINIO_ENDPOINT}")
    print(f" User     : {MINIO_ROOT_USER}")
    print(f" Secure   : {MINIO_SECURE}")
    print("============================================================")

    client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ROOT_USER,
        secret_key=MINIO_ROOT_PASSWORD,
        secure=MINIO_SECURE,
    )

    wait_for_minio(client)

    for bucket_cfg in BUCKETS:
        print(f"\n[init_bucket] Processing bucket: {bucket_cfg['name']}")
        print(f"              {bucket_cfg.get('description', '')}")
        create_bucket(client, bucket_cfg)

    print("\n[init_bucket] All buckets initialised successfully.")
    print("============================================================")


if __name__ == "__main__":
    main()