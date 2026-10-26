"""Explicit live Gemini connectivity verification."""

import asyncio

import pytest

from app.core.config import Settings
from app.providers.gemini import open_gemini_provider


@pytest.mark.external
def test_live_gemini_provider() -> None:
    async def run() -> str:
        settings = Settings()
        async with open_gemini_provider(settings) as provider:
            return await provider.generate(
                "You are the AI provider for Causolve. "
                "Respond with exactly AI_PROVIDER_OK "
                "and no additional text."
            )

    result = asyncio.run(run())

    assert result == "AI_PROVIDER_OK"
    print("Gemini provider returned AI_PROVIDER_OK")
