from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/restaurant_db",
        alias="DATABASE_URL",
    )

    # JWT
    jwt_secret_key: str = Field(default="changeme-super-secret-key", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=60 * 24, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")

    # MinIO
    minio_endpoint: str = Field(default="localhost:9000", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="minioadmin", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="minioadmin", alias="MINIO_SECRET_KEY")
    minio_bucket_name: str = Field(default="menu-images", alias="MINIO_BUCKET_NAME")
    minio_secure: bool = Field(default=False, alias="MINIO_SECURE")
    minio_public_url: str = Field(default="http://localhost:9000", alias="MINIO_PUBLIC_URL")

    # App
    app_env: str = Field(default="development", alias="APP_ENV")

    model_config = {"env_file": ".env", "populate_by_name": True}


@lru_cache()
def get_settings() -> Settings:
    return Settings()