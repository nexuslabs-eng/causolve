"""Validation and isolation tests for internal graph state."""

import pytest
from pydantic import ValidationError

from app.graph.state import (
    GraphExecutionResult,
    GraphInput,
    create_initial_state,
)

INVESTIGATION_ID = "11111111-1111-4111-8111-111111111111"


def test_graph_input_accepts_valid_investigation_id() -> None:
    graph_input = GraphInput(investigation_id=INVESTIGATION_ID)

    assert graph_input.investigation_id == INVESTIGATION_ID


@pytest.mark.parametrize("value", ["not-a-uuid", "", None, 123])
def test_graph_input_rejects_invalid_investigation_id(value: object) -> None:
    with pytest.raises(ValidationError):
        GraphInput.model_validate({"investigation_id": value})


def test_graph_input_rejects_unexpected_fields() -> None:
    with pytest.raises(ValidationError):
        GraphInput.model_validate(
            {
                "investigation_id": INVESTIGATION_ID,
                "unexpected": "value",
            }
        )


def test_initial_state_is_fresh_for_each_execution() -> None:
    graph_input = GraphInput(investigation_id=INVESTIGATION_ID)

    first = create_initial_state(graph_input)
    second = create_initial_state(graph_input)

    assert (
        first
        == second
        == {
            "investigation_id": INVESTIGATION_ID,
            "phase": "pending",
            "foundation_check_passed": False,
        }
    )
    assert first is not second

    first["phase"] = "finished"
    first["foundation_check_passed"] = True

    assert second["phase"] == "pending"
    assert second["foundation_check_passed"] is False


def test_completed_result_is_validated() -> None:
    result = GraphExecutionResult(
        investigation_id=INVESTIGATION_ID,
        phase="finished",
        foundation_check_passed=True,
    )

    assert result.phase == "finished"
    assert result.foundation_check_passed is True


@pytest.mark.parametrize(
    ("phase", "passed"),
    [
        ("pending", False),
        ("initialized", True),
        ("finished", False),
        ("finished", "true"),
    ],
)
def test_incomplete_or_invalid_result_is_rejected(
    phase: str,
    passed: object,
) -> None:
    with pytest.raises(ValidationError):
        GraphExecutionResult.model_validate(
            {
                "investigation_id": INVESTIGATION_ID,
                "phase": phase,
                "foundation_check_passed": passed,
            }
        )
