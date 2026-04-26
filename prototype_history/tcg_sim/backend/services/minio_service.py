import io
from minio import Minio
from minio.error import S3Error
from core.config import get_settings

settings = get_settings()


def get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )


def ensure_bucket_exists(client: Minio, bucket: str) -> None:
    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            # Set public read policy
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
    except S3Error as e:
        print(f"MinIO bucket error: {e}")


def upload_image(image_data: bytes, object_name: str, content_type: str = "image/png") -> str:
    client = get_minio_client()
    ensure_bucket_exists(client, settings.MINIO_BUCKET)
    client.put_object(
        settings.MINIO_BUCKET,
        object_name,
        io.BytesIO(image_data),
        length=len(image_data),
        content_type=content_type,
    )
    return object_name


def get_presigned_url(object_name: str) -> str:
    """Return a presigned URL valid for 7 days."""
    from datetime import timedelta
    client = get_minio_client()
    try:
        url = client.presigned_get_object(
            settings.MINIO_BUCKET,
            object_name,
            expires=timedelta(days=7),
        )
        return url
    except S3Error:
        return ""


def get_public_url(object_name: str) -> str:
    """Return a direct public URL (works if bucket policy is public)."""
    endpoint = settings.MINIO_ENDPOINT
    bucket = settings.MINIO_BUCKET
    scheme = "https" if settings.MINIO_SECURE else "http"
    return f"{scheme}://{endpoint}/{bucket}/{object_name}"