import io
import json
import logging
from urllib.parse import urlunparse

from minio import Minio
from minio.error import S3Error

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_client() -> Minio:
    """Create and return a MinIO client instance."""
    return Minio(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_use_ssl,
    )


def ensure_bucket_exists() -> None:
    """
    Ensure the configured MinIO bucket exists and has a public-read policy.
    Called once at application startup.
    """
    client = _get_client()
    bucket = settings.minio_bucket_name

    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            logger.info("Created MinIO bucket: %s", bucket)
        else:
            logger.info("MinIO bucket already exists: %s", bucket)

        # Set public-read bucket policy
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket}/*"],
                }
            ],
        }
        client.set_bucket_policy(bucket, json.dumps(policy))
        logger.info("Applied public-read policy to bucket: %s", bucket)

    except S3Error as exc:
        logger.error("MinIO bucket setup failed: %s", exc)
        raise


def upload_file(
    object_name: str,
    file_data: bytes,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload a file to MinIO and return its public URL.

    Args:
        object_name: The key/path within the bucket.
        file_data: Raw bytes of the file.
        content_type: MIME type of the file.

    Returns:
        Public URL string for the uploaded object.
    """
    client = _get_client()
    bucket = settings.minio_bucket_name

    file_stream = io.BytesIO(file_data)
    file_size = len(file_data)

    client.put_object(
        bucket_name=bucket,
        object_name=object_name,
        data=file_stream,
        length=file_size,
        content_type=content_type,
    )

    # Build public URL using the configured public base URL
    public_url = f"{settings.minio_public_base_url.rstrip('/')}/{bucket}/{object_name}"
    logger.info("Uploaded object %s → %s", object_name, public_url)
    return public_url


def delete_file(object_name: str) -> None:
    """
    Delete an object from MinIO.

    Args:
        object_name: The key/path within the bucket.
    """
    client = _get_client()
    bucket = settings.minio_bucket_name

    try:
        client.remove_object(bucket_name=bucket, object_name=object_name)
        logger.info("Deleted object %s from bucket %s", object_name, bucket)
    except S3Error as exc:
        logger.warning("Failed to delete object %s: %s", object_name, exc)


def extract_object_name_from_url(image_url: str) -> str | None:
    """
    Extract the MinIO object name from a full public URL.

    Example:
        "http://localhost:9000/menu-images/items/42/photo.jpg"
        → "items/42/photo.jpg"
    """
    bucket = settings.minio_bucket_name
    marker = f"/{bucket}/"
    idx = image_url.find(marker)
    if idx == -1:
        return None
    return image_url[idx + len(marker):]