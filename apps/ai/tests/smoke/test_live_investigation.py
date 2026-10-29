"""Opt-in verification of the endpoint, graph, and live Gemini provider."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.api.investigations import FOUNDATION_ONLY_MESSAGE
from app.contracts.investigation import AIInvestigationResult
from app.core.config import Settings
from app.main import create_app

FIXTURE = (
    Path(__file__).resolve().parents[4]
    / "packages/contracts/fixtures/internal-ai/boundary.json"
)


@pytest.mark.external
def test_live_investigation_graph() -> None:
    request = json.loads(FIXTURE.read_text(encoding="utf-8"))["request"]
    settings = Settings()
    configured_secret = settings.internal_api_key

    assert configured_secret is not None
    internal_api_key = configured_secret.get_secret_value().strip()
    assert internal_api_key

    with TestClient(create_app(settings)) as client:
        response = client.post(
            "/investigations/run",
            json=request,
            headers={
                "Authorization": f"Bearer {internal_api_key}",
            },
        )

    assert response.status_code == 200
    result = AIInvestigationResult.model_validate(response.json())

    assert result.investigation_id == request["investigationId"]
    assert result.status == "DEGRADED", result.error
    assert result.error == FOUNDATION_ONLY_MESSAGE
    assert result.hypothesis_proposals == []
    assert result.evidence_interpretations == []
    assert result.recommendation_proposal is None
