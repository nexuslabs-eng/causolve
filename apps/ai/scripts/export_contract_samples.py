"""Export fixtures and deterministic endpoint results for Zod verification."""

import argparse
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi.testclient import TestClient

from app.api.dependencies import get_provider_factory
from app.contracts.investigation import (
    AIInvestigationResult,
    StartAIInvestigationRequest,
)
from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.graph.provider_workflow import PROVIDER_ACKNOWLEDGEMENT
from app.main import create_app

SAMPLE_INTERNAL_API_KEY = "sample-internal-api-key-0000000000001"
SAMPLE_HEADERS = {
    "Authorization": f"Bearer {SAMPLE_INTERNAL_API_KEY}",
}

REPO_ROOT = Path(__file__).resolve().parents[3]
FIXTURE = REPO_ROOT / "packages/contracts/fixtures/internal-ai/boundary.json"


class SampleProvider:
    def __init__(self, *, fail: bool) -> None:
        self.fail = fail

    async def generate(self, prompt: str) -> str:
        if self.fail:
            raise ProviderError("unavailable", "Synthetic provider failure")
        return PROVIDER_ACKNOWLEDGEMENT


def export_execution(request: dict, *, fail: bool) -> dict:
    application = create_app(
        Settings(
            _env_file=None, app_env="test", internal_api_key=SAMPLE_INTERNAL_API_KEY
        )
    )

    @asynccontextmanager
    async def factory(settings: Settings):
        yield SampleProvider(fail=fail)

    application.dependency_overrides[get_provider_factory] = lambda: factory

    with TestClient(application) as client:
        response = client.post(
            "/investigations/run", json=request, headers=SAMPLE_HEADERS
        )

    response.raise_for_status()
    result = AIInvestigationResult.model_validate(response.json())
    return result.model_dump(mode="json", by_alias=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    request = StartAIInvestigationRequest.model_validate(fixture["request"])
    result = AIInvestigationResult.model_validate(fixture["result"])
    request_json = request.model_dump(mode="json", by_alias=True)

    output = {
        "request": request_json,
        "result": result.model_dump(mode="json", by_alias=True),
        "execution": export_execution(request_json, fail=False),
        "failure": export_execution(request_json, fail=True),
    }

    args.output.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Exported Python contract samples to {args.output}")


if __name__ == "__main__":
    main()
