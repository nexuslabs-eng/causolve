"""Deterministic graph node and transition tests."""

import asyncio

import pytest

from app.graph.nodes import check_foundation, initialize
from app.graph.state import GraphInput, GraphPhase, create_initial_state

INVESTIGATION_ID = "11111111-1111-4111-8111-111111111111"


def test_initialize_returns_update_without_mutating_input() -> None:
    state = create_initial_state(GraphInput(investigation_id=INVESTIGATION_ID))
    original = state.copy()

    update = asyncio.run(initialize(state))

    assert update == {
        "phase": "initialized",
        "foundation_check_passed": False,
    }
    assert state == original


@pytest.mark.parametrize("phase", ["initialized", "finished"])
def test_initialize_rejects_non_pending_state(phase: GraphPhase) -> None:
    state = create_initial_state(GraphInput(investigation_id=INVESTIGATION_ID))
    state["phase"] = phase

    with pytest.raises(ValueError, match="requires pending"):
        asyncio.run(initialize(state))


def test_foundation_check_returns_update_without_mutating_input() -> None:
    state = create_initial_state(GraphInput(investigation_id=INVESTIGATION_ID))
    state["phase"] = "initialized"
    original = state.copy()

    update = asyncio.run(check_foundation(state))

    assert update == {
        "phase": "finished",
        "foundation_check_passed": True,
    }
    assert state == original


@pytest.mark.parametrize("phase", ["pending", "finished"])
def test_foundation_check_rejects_invalid_phase(phase: GraphPhase) -> None:
    state = create_initial_state(GraphInput(investigation_id=INVESTIGATION_ID))
    state["phase"] = phase

    with pytest.raises(ValueError, match="requires initialized"):
        asyncio.run(check_foundation(state))
