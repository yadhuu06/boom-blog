from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",        # read from .env file
        env_file_encoding="utf-8",
        extra="ignore",         # ignore unexpected env vars
    )

    # App
    PROJECT_NAME: str = "Boom-Blog"
    ENVIRONMENT: str = "development"  # dev / prod / staging

    # Database
    DATABASE_URL: str
    DB_SCHEMA: str = "public"

    # Security / Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


settings = Settings()
