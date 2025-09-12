
import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):

    PROJECT_NAME: str = "Boom-Blog" 
    ENVIRONMENT: str = "development"
    DATABASE_URL: str  
    DB_SCHEMA: str = "boom_blog"  
    SECRET_KEY: str     
    ALGORITHM: str = "HS256"  
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  
    CLOUDINARY_CLOUD_NAME: str  
    CLOUDINARY_API_KEY: str  
    CLOUDINARY_API_SECRET: str  
    CLOUDINARY_FOLDER: str = "Boom"  
    CLOUDINARY_UPLOAD_PRESET: str 

    class Config:
        env_file = ENV_PATH
        env_file_encoding = "utf-8"


settings = Settings()
