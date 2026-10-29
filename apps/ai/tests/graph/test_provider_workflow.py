"""Provider graph validation without external requests."""

import asyncio
from unittest.mock import AsyncMock

import pytest

from app.graph.provider_workflow import (
    PROVIDER_ACKNOWLEDGEMENT,
    PROVIDER_PROMPT,
    ProviderGraphRunner,
)
from app.graph.state import GraphInput

FIRST_ID = "11111111-1111-4111-8111-111111111111"
SECOND_ID = "22222222-2222-4222-8222-222222222222"


class FakeProvider:
    def __init__(self) -> None:
        self.generate = AsyncMock(return_value=PROVIDER_ACKNOWLEDGEMENT)


def test_provider_graph_validates_completed_output() -> None:
    provider = FakeProvider()

    result = asyncio.run(
        ProviderGraphRunner().run(
            GraphInput(investigation_id=FIRST_ID),
            provider=provider,
        )
    )

    assert result.investigation_id == FIRST_ID
    assert result.phase == "finished"
    assert result.foundation_check_passed is True
    assert result.provider_verified is True
    provider.generate.assert_awaited_once_with(PROVIDER_PROMPT)


def test_concurrent_provider_runs_are_isolated() -> None:
    async def execute() -> None:
        runner = ProviderGraphRunner()
        first_provider = FakeProvider()
        second_provider = FakeProvider()

        first, second = await asyncio.gather(
            runner.run(
                GraphInput(investigation_id=FIRST_ID),
                provider=first_provider,
            ),
            runner.run(
                GraphInput(investigation_id=SECOND_ID),
                provider=second_provider,
            ),
        )

        assert first.investigation_id == FIRST_ID
        assert second.investigation_id == SECOND_ID
        first_provider.generate.assert_awaited_once_with(PROVIDER_PROMPT)
        second_provider.generate.assert_awaited_once_with(PROVIDER_PROMPT)

    asyncio.run(execute())


def test_cancellation_propagates() -> None:
    class CancelledProvider:
        async def generate(self, prompt: str) -> str:
            raise asyncio.CancelledError()

    with pytest.raises(asyncio.CancelledError):
        asyncio.run(
            ProviderGraphRunner().run(
                GraphInput(investigation_id=FIRST_ID),
                provider=CancelledProvider(),
            )
        )
