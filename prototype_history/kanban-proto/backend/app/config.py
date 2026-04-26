from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://kanban:kanban@db:5432/kanbandb"
    JWT_SECRET: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()