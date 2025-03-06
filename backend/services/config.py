import os, secrets, sys
from pydantic_settings import BaseSettings
from typing import List
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
load_dotenv()


class Settings(BaseSettings):
    API_VERSION: str = "1.0"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/taskmanager")

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI")

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 6000
    SECRET_KEY: str = secrets.token_hex(32)[0]
    BEARER_SECURITY: HTTPBearer = HTTPBearer()

    # OPENAI_KEY: str = os.getenv("GOOGLE_CLIENT_ID")
    GEMINI_KEY: str = os.getenv("GEMINI_KEY")

settings = Settings()
