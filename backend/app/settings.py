from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """EtherTarot application settings loaded from environment variables."""

    # App
    app_name: str = "EtherTarot API"
    debug: bool = False
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Anthropic
    anthropic_api_key: str = ""

    # LLM models
    classifier_model: str = "claude-haiku-4-5-20251001"
    interpretation_model: str = "claude-opus-4-5-20251101"

    # API
    api_v1_prefix: str = "/api/v1"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
