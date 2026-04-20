import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://admin:secret@localhost:5432/hospital_sim",
    )
    SYNC_DATABASE_URL: str = os.getenv(
        "SYNC_DATABASE_URL",
        "postgresql://admin:secret@localhost:5432/hospital_sim",
    )
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8080
    STARTING_BUDGET: float = 500_000.0
    DEFAULT_SPEED_MULTIPLIER: float = 1.0
    TICK_INTERVAL_SECONDS: float = 5.0  # real seconds per sim tick at 1x speed

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Fix asyncpg URL scheme
if settings.DATABASE_URL.startswith("postgresql://") and "asyncpg" not in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )

if settings.SYNC_DATABASE_URL.startswith("postgresql+asyncpg://"):
    settings.SYNC_DATABASE_URL = settings.SYNC_DATABASE_URL.replace(
        "postgresql+asyncpg://", "postgresql://", 1
    )