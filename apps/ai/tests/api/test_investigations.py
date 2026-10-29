"""Investigation endpoint tests using the real graph and fake providers."""

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_provider_factory, get_provider_graph_runner
from app.api.investigations import FOUNDATION_ONLY_MESSAGE
from app.contracts.investigation import AIInvestigationResult
from app.core.config import Settings
from app.core.exceptions import ProviderConfigurationError, ProviderError
from app.graph.provider_workflow import PROVIDER_ACKNOWLEDGEMENT, PROVIDER_PROMPT
from app.main import create_app

FIXTURE = (
    Path(__file__).resolve().parents[4]
    / "packages/contracts/fixtures/internal-ai/boundary.json"
)
REQUEST = json.loads(FIXTURE.read_text(encoding="utf-8"))["request"]

TEST_INTERNAL_API_KEY = "test-internal-api-key-0000000000000001"
AUTH_HEADERS = {"Authorization": f"Bearer {TEST_INTERNAL_API_KEY}"}


class FakeProvider:
    def __init__(
        self,
        response: object = PROVIDER_ACKNOWLEDGEMENT,
        error: Exception | None = None,
    ) -> None:
        self.generate = AsyncMock(return_value=response, side_effect=error)


def make_app(provider: FakeProvider):
    application = create_app(
        Settings(
            _env_file=None,
            app_env="test",
            internal_api_key=TEST_INTERNAL_API_KEY,
        )
    )
    lifecycle = {"opened": 0, "closed": 0}

    @asynccontextmanager
    async def factory(settings: Settings):
        lifecycle["opened"] += 1
        try:
            yield provider
        finally:
            lifecycle["closed"] += 1

    application.dependency_overrides[get_provider_factory] = lambda: factory
    return application, lifecycle


def assert_empty_proposals(body: dict) -> None:
    AIInvestigationResult.model_validate(body)
    assert body["investigationId"] == REQUEST["investigationId"]
    assert body["hypothesisProposals"] == []
    assert body["evidenceInterpretations"] == []
    assert body["recommendationProposal"] is None


def test_endpoint_executes_graph_without_fabricating_proposals() -> None:
    provider = FakeProvider()
    application, lifecycle = make_app(provider)

    with TestClient(application) as client:
        first = client.post("/investigations/run", json=REQUEST, headers=AUTH_HEADERS)
        second = client.post("/investigations/run", json=REQUEST, headers=AUTH_HEADERS)

    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
    body = first.json()
    assert_empty_proposals(body)
    assert body["status"] == "DEGRADED"
    assert body["error"] == FOUNDATION_ONLY_MESSAGE
    assert provider.generate.await_count == 2
    provider.generate.assert_awaited_with(PROVIDER_PROMPT)
    assert lifecycle == {"opened": 2, "closed": 2}


@pytest.mark.parametrize("response", [None, "", "  ", "unexpected response"])
def test_invalid_provider_output_returns_failed_result(response: object) -> None:
    application, lifecycle = make_app(FakeProvider(response=response))

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run", json=REQUEST, headers=AUTH_HEADERS
        )

    assert response.status_code == 200
    body = response.json()
    assert_empty_proposals(body)
    assert body["status"] == "FAILED"
    assert body["error"] == "AI provider execution failed (response)."
    assert lifecycle["closed"] == 1


@pytest.mark.parametrize(
    ("failure", "expected"),
    [
        (
            ProviderError("timeout", "Sensitive provider details"),
            "AI provider execution failed (timeout).",
        ),
        (
            ProviderError("rate_limit", "Sensitive provider details"),
            "AI provider execution failed (rate_limit).",
        ),
        (
            ProviderError("unavailable", "Sensitive provider details"),
            "AI provider execution failed (unavailable).",
        ),
        (
            TimeoutError("Sensitive provider details"),
            "Graph execution timed out.",
        ),
        (
            RuntimeError("Sensitive provider details"),
            "Unexpected graph execution failure.",
        ),
    ],
)
def test_execution_failures_are_controlled(
    failure: Exception,
    expected: str,
) -> None:
    application, lifecycle = make_app(FakeProvider(error=failure))

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run", json=REQUEST, headers=AUTH_HEADERS
        )

    assert response.status_code == 200
    body = response.json()
    assert_empty_proposals(body)
    assert body["status"] == "FAILED"
    assert body["error"] == expected
    assert "Sensitive" not in response.text
    assert lifecycle["closed"] == 1


def test_configuration_failure_is_controlled() -> None:
    application = create_app(
        Settings(_env_file=None, app_env="test", internal_api_key=TEST_INTERNAL_API_KEY)
    )

    @asynccontextmanager
    async def failing_factory(settings: Settings):
        raise ProviderConfigurationError("Sensitive configuration details")
        yield  # Establish an async context manager without opening a provider.

    application.dependency_overrides[get_provider_factory] = lambda: failing_factory

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run",
            json=REQUEST,
            headers=AUTH_HEADERS,
        )

    assert response.status_code == 200
    assert response.json()["status"] == "FAILED"
    assert response.json()["error"] == "AI provider configuration is unavailable."
    assert "Sensitive" not in response.text


def test_unexpected_runner_failure_is_controlled() -> None:
    provider = FakeProvider()
    application, lifecycle = make_app(provider)

    class FailingRunner:
        async def run(self, *args, **kwargs):
            raise RuntimeError("Sensitive graph details")

    application.dependency_overrides[get_provider_graph_runner] = FailingRunner

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run", json=REQUEST, headers=AUTH_HEADERS
        )

    assert response.status_code == 200
    assert response.json()["status"] == "FAILED"
    assert response.json()["error"] == "Unexpected graph execution failure."
    provider.generate.assert_not_called()
    assert lifecycle["closed"] == 1


def test_invalid_request_does_not_open_provider() -> None:
    provider = FakeProvider()
    application, lifecycle = make_app(provider)

    with TestClient(application) as client:
        response = client.post("/investigations/run", json={}, headers=AUTH_HEADERS)

    assert response.status_code == 422
    provider.generate.assert_not_called()
    assert lifecycle == {"opened": 0, "closed": 0}


def test_missing_credentials_are_rejected_before_provider_opens() -> None:
    provider = FakeProvider()
    application, lifecycle = make_app(provider)

    with TestClient(application) as client:
        response = client.post("/investigations/run", json=REQUEST)

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid internal service credentials."}
    assert response.headers["www-authenticate"] == "Bearer"
    provider.generate.assert_not_called()
    assert lifecycle == {"opened": 0, "closed": 0}


def test_invalid_credentials_are_rejected_before_provider_opens() -> None:
    provider = FakeProvider()
    application, lifecycle = make_app(provider)

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run",
            json=REQUEST,
            headers={"Authorization": "Bearer incorrect-secret"},
        )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid internal service credentials."}
    provider.generate.assert_not_called()
    assert lifecycle == {"opened": 0, "closed": 0}


def test_missing_server_credentials_return_service_unavailable() -> None:
    application = create_app(
        Settings(
            _env_file=None,
            app_env="test",
            internal_api_key=None,
        )
    )

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run",
            json=REQUEST,
            headers=AUTH_HEADERS,
        )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Internal service authentication is unavailable."
    }


def test_execution_deadline_returns_controlled_failure() -> None:
    class SlowProvider:
        async def generate(self, prompt: str) -> str:
            await asyncio.sleep(3)
            return PROVIDER_ACKNOWLEDGEMENT

    application = create_app(
        Settings(
            _env_file=None,
            app_env="test",
            internal_api_key=TEST_INTERNAL_API_KEY,
            gemini_timeout_seconds=1,
            execution_timeout_seconds=2,
        )
    )

    @asynccontextmanager
    async def factory(settings: Settings):
        yield SlowProvider()

    application.dependency_overrides[get_provider_factory] = lambda: factory

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run",
            json=REQUEST,
            headers=AUTH_HEADERS,
        )

    assert response.status_code == 200
    assert response.json()["status"] == "FAILED"
    assert response.json()["error"] == "Graph execution timed out."
