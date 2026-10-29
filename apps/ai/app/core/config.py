"""Validated configuration for the AI service."""

from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
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
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    internal_api_key: SecretStr | None = None

    gemini_api_key: SecretStr | None = None
    gemini_model: str = ""
    gemini_timeout_seconds: int = Field(default=60, ge=1, le=300)

    execution_timeout_seconds: int = Field(default=180, ge=1, le=600)

    @model_validator(mode="after")
    def validate_runtime_configuration(self) -> "Settings":
        internal_key = (
            self.internal_api_key.get_secret_value().strip()
            if self.internal_api_key is not None
            else ""
        )
        gemini_key = (
            self.gemini_api_key.get_secret_value().strip()
            if self.gemini_api_key is not None
            else ""
        )

        if internal_key and len(internal_key) < 32:
            raise ValueError("AI_INTERNAL_API_KEY must contain at least 32 characters.")

        if self.execution_timeout_seconds <= self.gemini_timeout_seconds:
            raise ValueError(
                "AI_EXECUTION_TIMEOUT_SECONDS must be greater than "
                "AI_GEMINI_TIMEOUT_SECONDS."
            )

        if self.app_env == "production":
            if self.docs_enabled:
                raise ValueError("API documentation must be disabled in production.")
            if not internal_key:
                raise ValueError(
                    "AI_INTERNAL_API_KEY must be configured in production."
                )
            if not gemini_key:
                raise ValueError("AI_GEMINI_API_KEY must be configured in production.")
            if not self.gemini_model.strip():
                raise ValueError("AI_GEMINI_MODEL must be configured in production.")

        return self
