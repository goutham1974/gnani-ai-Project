import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_ENV = BASE_DIR.parent / ".env"
LOCAL_ENV = BASE_DIR / ".env"

env_file_path = str(ROOT_ENV if ROOT_ENV.exists() else LOCAL_ENV)

class Settings(BaseSettings):
    PROJECT_NAME: str = "RYTHUM AI"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Gnani.ai API Configuration
    GNANI_API_KEY: str = ""
    GNANI_BASE_URL: str = "https://api.vachana.ai"
    GNANI_STT_MODEL: str = "prisma-v3.0"
    GNANI_STT_ENDPOINT: str = "https://api.vachana.ai/stt/v3"
    GNANI_TTS_MODEL: str = "timbre-v3.0"
    GNANI_TTS_ENDPOINT: str = "https://api.vachana.ai/api/v1/tts/inference"

    # Default Voice Mapping for 6 Languages (Supported in Timbre v3.0: Lakshmi, Avinash, Shivani, Kalpana, etc.)
    GNANI_DEFAULT_VOICE_TELUGU: str = "Lakshmi"
    GNANI_DEFAULT_VOICE_HINDI: str = "Lakshmi"
    GNANI_DEFAULT_VOICE_KANNADA: str = "Lakshmi"
    GNANI_DEFAULT_VOICE_TAMIL: str = "Lakshmi"
    GNANI_DEFAULT_VOICE_MARATHI: str = "Lakshmi"
    GNANI_DEFAULT_VOICE_ENGLISH: str = "Lakshmi"

    # LLM Settings (Gemini / OpenAI / Groq / Local)
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", "groq", "mock"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    EVON_HF_MODEL_ID: str = "GnaniAI/evon-3.3"

    # Database
    DATABASE_URL: str = "sqlite:///./rythum.db"

    # Weather
    WEATHER_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = env_file_path
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
