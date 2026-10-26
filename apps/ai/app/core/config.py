"""Validated configuration for the AI service."""

from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

AI_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from the service environment."""

    model_config = SettingsConfigDict(
        env_file=AI_ROOT / ".env",
        env_file_encoding="utf-8",
        env_prefix="AI_",
        extra="forbid",
    )

    app_env: Literal["development", "test", "production"] = "development"
    docs_enabled: bool = False

    gemini_api_key: SecretStr | None = None
    gemini_model: str = ""
    gemini_timeout_seconds: int = Field(default=60, ge=1, le=300)
