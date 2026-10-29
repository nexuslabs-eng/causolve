"""Gemini implementation using Google's official asynchronous SDK."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import httpx
from google import genai
from google.genai import errors, types
from google.genai.client import AsyncClient

from app.core.config import Settings
from app.core.exceptions import (
    ProviderConfigurationError,
    ProviderError,
    ProviderErrorKind,
)
from app.providers.base import AIProvider


def translate_api_error(error: errors.APIError) -> ProviderError:
    if error.code in (401, 403):
        kind: ProviderErrorKind = "authentication"
    elif error.code == 429:
        kind = "rate_limit"
    elif error.code in (408, 504):
        kind = "timeout"
    elif error.code >= 500:
        kind = "unavailable"
    else:
        kind = "request"

    return ProviderError(
        kind,
        f"Gemini rejected the request (HTTP {error.code}).",
    )


class GeminiProvider:
    def __init__(self, client: AsyncClient, model: str) -> None:
        self._client = client
        self._model = model

    async def generate(self, prompt: str) -> str:
        if not prompt.strip():
            raise ValueError("Prompt must not be blank.")

        try:
            response = await self._client.models.generate_content(
                model=self._model, contents=prompt
            )
            text = response.text

        except errors.APIError as error:
            raise translate_api_error(error) from None
        except httpx.TimeoutException:
            raise ProviderError("timeout", "Gemini request timed out.") from None
        except httpx.RequestError:
            raise ProviderError(
                "network", "Could not communicate with Gemini."
            ) from None
        except errors.UnknownApiResponseError:
            raise ProviderError(
                "response", "Gemini returned an unreadable response."
            ) from None
        except Exception:
            raise ProviderError(
                "internal", "Unexpected Gemini client failure."
            ) from None

        if not isinstance(text, str) or not text.strip():
            raise ProviderError("response", "Gemini returned no usable text.")

        return text.strip()


@asynccontextmanager
async def open_gemini_provider(settings: Settings) -> AsyncGenerator[AIProvider]:
    secret = settings.gemini_api_key
    key = secret.get_secret_value().strip() if secret is not None else ""
    model = settings.gemini_model.strip()

    if not key:
        raise ProviderConfigurationError("AI_GEMINI_API_KEY must be configured.")
    if not model:
        raise ProviderConfigurationError("AI_GEMINI_MODEL must be configured.")

    try:
        client = genai.Client(
            api_key=key,
            http_options=types.HttpOptions(
                timeout=settings.gemini_timeout_seconds * 1000,
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        ).aio
    except Exception:
        raise ProviderConfigurationError(
            "Gemini client initialization failed."
        ) from None

    try:
        yield GeminiProvider(client, model)
    finally:
        await client.aclose()
