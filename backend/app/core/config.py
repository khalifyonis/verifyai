import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VERIFAI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "verifai-super-secret-jwt-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Defaults to SQLite async for zero-friction setup; switchable to PostgreSQL via .env
    DATABASE_URL: str = "sqlite+aiosqlite:///./verifai.db"
    
    # Uploads directory
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # External AI / Vision settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    AI_FALLBACK_MODE: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
