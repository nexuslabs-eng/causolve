"""Tests for configuration loading and validation."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core.config import Settings


@pytest.fixture(autouse=True)
def clear_settings_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("AI_APP_ENV", raising=False)
    monkeypatch.delenv("AI_DOCS_ENABLED", raising=False)


def test_defaults_without_dotenv() -> None:
    settings = Settings(_env_file=None)

    assert settings.app_env == "development"
    assert settings.docs_enabled is False


def test_environement_overrides_dotenv(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "AI_APP_ENV=development\nAI_DOCS_ENABLED=true\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("AI_APP_ENV", "production")
    monkeypatch.delenv("AI_GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("AI_GEMINI_MODEL", raising=False)
    monkeypatch.delenv("AI_GEMINI_TIMEOUT_SECONDS", raising=False)

    settings = Settings(_env_file=env_file)

    assert settings.app_env == "production"
    assert settings.docs_enabled is True


@pytest.mark.parametrize(
    ("variable", "value", "field"),
    [
        ("AI_APP_ENV", "staging", "app_env"),
        ("AI_DOCS_ENABLED", "perhaps", "docs_enabled"),
    ],
)
def test_invalid_environment_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
    variable: str,
    value: str,
    field: str,
) -> None:
    monkeypatch.setenv(variable, value)

    with pytest.raises(ValidationError) as error:
        Settings(_env_file=None)

    assert error.value.errors()[0]["loc"] == (field,)


def test_unknown_dotenv_setting_is_rejected(tmp_path: Path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text("AI_DOCS_ENABELD=true\n", encoding="utf-8")

    with pytest.raises(ValidationError) as error:
        Settings(_env_file=env_file)

    assert error.value.errors()[0]["type"] == "extra_forbidden"


@pytest.mark.parametrize("timeout", [0, 301])
def test_provider_timeout_is_bounded(timeout: int) -> None:
    with pytest.raises(ValidationError) as error:
        Settings(
            _env_file=None,
            gemini_timeout_seconds=timeout,
        )

    detail = error.value.errors()[0]
    assert detail["loc"] == ("gemini_timeout_seconds",)
    assert detail["type"] == (
        "greater_than_equal" if timeout == 0 else "less_than_equal"
    )
