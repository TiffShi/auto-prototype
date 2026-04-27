import io
import uuid
from minio import Minio
from minio.error import S3Error
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_client() -> Minio:
    """Instantiate and return a MinIO client."""
    return Minio(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )


def ensure_bucket_exists() -> None:
    """Create the menu-images bucket if it does not already exist."""
    client = _get_client()
    bucket = settings.minio_bucket_name
    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            # Set bucket policy to allow public read access
            import json
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
            logger.info("Bucket '%s' created with public-read policy.", bucket)
        else:
            logger.info("Bucket '%s' already exists.", bucket)
    except S3Error as exc:
        logger.error("MinIO bucket setup error: %s", exc)
        raise


def upload_image(file_data: bytes, content_type: str, original_filename: str) -> str:
    """
    Upload an image to MinIO and return its public URL.

    :param file_data: Raw bytes of the image.
    :param content_type: MIME type (e.g., 'image/jpeg').
    :param original_filename: Original file name for extension extraction.
    :return: Public URL string pointing to the uploaded object.
    """
    client = _get_client()
    bucket = settings.minio_bucket_name

    # Generate a unique object name preserving the file extension
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    object_name = f"items/{uuid.uuid4()}.{ext}"

    client.put_object(
        bucket_name=bucket,
        object_name=object_name,
        data=io.BytesIO(file_data),
        length=len(file_data),
        content_type=content_type,
    )

    # Return a direct public URL (bucket has public-read policy)
    public_url = f"{settings.minio_public_url}/{bucket}/{object_name}"
    logger.info("Uploaded image to MinIO: %s", public_url)
    return public_url


def delete_image(image_url: str) -> None:
    """
    Delete an image from MinIO given its full public URL.

    :param image_url: The full URL of the image to delete.
    """
    client = _get_client()
    bucket = settings.minio_bucket_name

    # Extract object name from URL: everything after /{bucket}/
    prefix = f"/{bucket}/"
    idx = image_url.find(prefix)
    if idx == -1:
        logger.warning("Could not parse object name from URL: %s", image_url)
        return

    object_name = image_url[idx + len(prefix):]
    try:
        client.remove_object(bucket, object_name)
        logger.info("Deleted image from MinIO: %s", object_name)
    except S3Error as exc:
        logger.error("Failed to delete image '%s': %s", object_name, exc)