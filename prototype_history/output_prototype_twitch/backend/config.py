from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8080
    DEBUG: bool = True

    # CORS — explicitly whitelist the Vite frontend origin
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.4.189:5173",
    ]

    # HLS settings
    HLS_SEGMENT_DURATION: int = 2  # seconds
    HLS_PLAYLIST_SIZE: int = 5     # number of segments in playlist
    HLS_OUTPUT_DIR: str = "hls_output"

    # Stream settings
    MAX_STREAMS: int = 10
    STREAM_TIMEOUT_SECONDS: int = 30  # seconds before inactive stream is removed

    # Chat settings
    MAX_CHAT_HISTORY: int = 100  # messages to keep in memory per stream

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()