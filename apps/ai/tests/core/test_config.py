"""Tests for configuration loading and validation."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core.config import Settings

TEST_INTERNAL_API_KEY = "test-internal-api-key-0000000000000001"


@pytest.fixture(autouse=True)
def clear_settings_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    for variable in [
        "AI_APP_ENV",
        "AI_DOCS_ENABLED",
        "AI_LOG_LEVEL",
        "AI_INTERNAL_API_KEY",
        "AI_GEMINI_API_KEY",
        "AI_GEMINI_MODEL",
        "AI_GEMINI_TIMEOUT_SECONDS",
        "AI_EXECUTION_TIMEOUT_SECONDS",
    ]:
        monkeypatch.delenv(variable, raising=False)


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
    monkeypatch.setenv("AI_APP_ENV", "test")

    settings = Settings(_env_file=env_file)

    assert settings.app_env == "test"
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


def test_execution_timeout_must_exceed_provider_timeout() -> None:
    with pytest.raises(ValidationError, match="must be greater"):
        Settings(
            _env_file=None,
            gemini_timeout_seconds=60,
            execution_timeout_seconds=60,
        )


@pytest.mark.parametrize("timeout", [0, 601])
def test_execution_timeout_is_bounded(timeout: int) -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            execution_timeout_seconds=timeout,
        )


def test_short_internal_api_key_is_rejected() -> None:
    with pytest.raises(ValidationError, match="at least 32"):
        Settings(
            _env_file=None,
            internal_api_key="too-short",
        )


def test_valid_production_configuration() -> None:
    settings = Settings(
        _env_file=None,
        app_env="production",
        docs_enabled=False,
        internal_api_key=TEST_INTERNAL_API_KEY,
        gemini_api_key="production-gemini-key",
        gemini_model="configured-model",
        gemini_timeout_seconds=60,
        execution_timeout_seconds=180,
    )

    assert settings.app_env == "production"
    assert settings.docs_enabled is False


@pytest.mark.parametrize(
    "overrides",
    [
        {"internal_api_key": None},
        {"gemini_api_key": None},
        {"gemini_model": ""},
        {"docs_enabled": True},
    ],
)
def test_invalid_production_configuration_is_rejected(
    overrides: dict[str, object],
) -> None:
    values: dict[str, object] = {
        "_env_file": None,
        "app_env": "production",
        "docs_enabled": False,
        "internal_api_key": TEST_INTERNAL_API_KEY,
        "gemini_api_key": "production-gemini-key",
        "gemini_model": "configured-model",
        "gemini_timeout_seconds": 60,
        "execution_timeout_seconds": 180,
    }
    values.update(overrides)

    with pytest.raises(ValidationError):
        Settings(**values)
