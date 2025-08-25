# config.py
import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Boom-Blog"
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    
    ENVIRONMENT: str = "development"
    DB_SCHEMA: str = "boom_blog"

    class Config:
        env_file = ENV_PATH
        env_file_encoding = "utf-8"

settings = Settings()
