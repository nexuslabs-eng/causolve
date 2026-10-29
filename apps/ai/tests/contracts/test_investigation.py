"""Contract fixtures checked independently by Python and TypeScript."""

import json
from copy import deepcopy
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.contracts.investigation import (
    AIInvestigationResult,
    StartAIInvestigationRequest,
)
from app.core.config import Settings
from app.main import create_app

TEST_INTERNAL_API_KEY = "test-internal-api-key-0000000000000001"
AUTH_HEADERS = {
    "Authorization": f"Bearer {TEST_INTERNAL_API_KEY}",
}

REPO_ROOT = Path(__file__).resolve().parents[4]
FIXTURES = REPO_ROOT / "packages/contracts/fixtures/internal-ai"
BOUNDARY = json.loads((FIXTURES / "boundary.json").read_text(encoding="utf-8"))
INVALID = json.loads((FIXTURES / "invalid.json").read_text(encoding="utf8"))
MODELS = {"request": StartAIInvestigationRequest, "result": AIInvestigationResult}


@pytest.mark.parametrize("name", ["request", "result"])
def test_shared_fixture_round_trip(name: str) -> None:
    model = MODELS[name].model_validate(BOUNDARY[name])

    assert model.model_dump(mode="json", by_alias=True) == BOUNDARY[name]


@pytest.mark.parametrize("case", INVALID)
def test_shared_invalid_cases(case: dict) -> None:
    value = deepcopy(BOUNDARY[case["model"]])
    parent = value
    for segment in case["path"][:-1]:
        parent = parent[segment]

    key = case["path"][-1]

    if case.get("remove"):
        del parent[key]
    else:
        parent[key] = case["value"]

    with pytest.raises(ValidationError):
        MODELS[case["model"]].model_validate(value)


def test_snake_case_cannot_replace_required_json_name() -> None:
    value = deepcopy(BOUNDARY["request"])
    value["investigation_id"] = value.pop("investigationId")

    with pytest.raises(ValidationError):
        StartAIInvestigationRequest.model_validate(value)


def test_unknown_properties_are_stripped() -> None:
    value = deepcopy(BOUNDARY["request"])
    value["unexpected"] = "ignored"

    model = StartAIInvestigationRequest.model_validate(value)

    assert model.model_dump(mode="json") == BOUNDARY["request"]


def test_proposal_text_and_references_are_trimmed() -> None:
    value = deepcopy(BOUNDARY["result"])
    value["hypothesisProposals"][0]["reference"] = " H1 "
    value["evidenceInterpretations"][0]["hypothesisReference"] = "\tH1\n"

    value["hypothesisProposals"][0]["statement"] = (
        " Synthetic hypothesis for contract testing "
    )
    value["evidenceInterpretations"][0]["reasoning"] = " Synthetic relation "
    value["recommendationProposal"]["summary"] = " Contract fixture only "
    value["recommendationProposal"]["reasoning"] = " No real investigation "

    model = AIInvestigationResult.model_validate(value)

    assert model.model_dump(mode="json", by_alias=True) == BOUNDARY["result"]


def test_endpoint_rejects_invalid_request() -> None:
    settings = Settings(
        _env_file=None,
        app_env="test",
        docs_enabled=False,
        internal_api_key=TEST_INTERNAL_API_KEY,
    )
    value = deepcopy(BOUNDARY["request"])
    del value["incident"]["description"]

    with TestClient(create_app(settings)) as client:
        response = client.post("/investigations/run", json=value, headers=AUTH_HEADERS)

    assert response.status_code == 422


@pytest.mark.parametrize(
    "capability",
    ["SERVICE_TOPOLOGY", "TRACE_SEARCH", "CHANGE_HISTORY", "RUNTIME_STATE", "ALERTS"],
)
def test_new_capabilities_are_accepted(capability: str) -> None:
    value = deepcopy(BOUNDARY["request"])
    value["capabilityStates"][0]["capability"] = capability

    model = StartAIInvestigationRequest.model_validate(value)

    assert model.capability_states[0].capability == capability


@pytest.mark.parametrize("relation", ["SUPPORTS", "CONTRADICTS", "NEUTRAL"])
def test_evidence_interpretation_relations_are_accepted(relation: str) -> None:
    value = deepcopy(BOUNDARY["result"])
    value["evidenceInterpretations"][0]["relation"] = relation

    model = AIInvestigationResult.model_validate(value)

    assert model.evidence_interpretations[0].relation == relation
