from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://rideshare_user:rideshare_pass@localhost:5432/rideshare"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8080
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()