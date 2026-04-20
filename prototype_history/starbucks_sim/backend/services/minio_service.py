import io
import uuid
from typing import Optional
from minio import Minio
from minio.error import S3Error
from fastapi import HTTPException, UploadFile
from config import get_settings

settings = get_settings()


def get_minio_client() -> Minio:
    return Minio(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )


def ensure_bucket_exists(client: Minio) -> None:
    try:
        if not client.bucket_exists(settings.MINIO_BUCKET):
            client.make_bucket(settings.MINIO_BUCKET)
            # Set public read policy
            import json
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{settings.MINIO_BUCKET}/*"],
                    }
                ],
            }
            client.set_bucket_policy(settings.MINIO_BUCKET, json.dumps(policy))
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"MinIO error: {str(e)}")


def upload_drink_image(file: UploadFile) -> str:
    """Upload image to MinIO and return the object name."""
    client = get_minio_client()
    ensure_bucket_exists(client)

    ext = ""
    if file.filename and "." in file.filename:
        ext = "." + file.filename.rsplit(".", 1)[-1].lower()

    object_name = f"drinks/{uuid.uuid4().hex}{ext}"

    file_data = file.file.read()
    file_size = len(file_data)
    content_type = file.content_type or "application/octet-stream"

    try:
        client.put_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            data=io.BytesIO(file_data),
            length=file_size,
            content_type=content_type,
        )
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

    return object_name


def get_presigned_url(object_name: str) -> str:
    """Generate a presigned URL for an object."""
    from datetime import timedelta
    client = get_minio_client()
    try:
        url = client.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            expires=timedelta(hours=24),
        )
        return url
    except S3Error as e:
        raise HTTPException(status_code=404, detail=f"Object not found: {str(e)}")


def delete_object(object_name: str) -> None:
    """Delete an object from MinIO."""
    client = get_minio_client()
    try:
        client.remove_object(settings.MINIO_BUCKET, object_name)
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete object: {str(e)}")