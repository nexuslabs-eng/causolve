"""Internal input, state, and output for the foundation graph."""

from typing import Literal, TypedDict

from pydantic import BaseModel, ConfigDict, model_validator

from app.contracts.base import Id

GraphPhase = Literal["pending", "initialized", "finished"]


class GraphInput(BaseModel):
    """Validated input accepted by the graph runner."""

    model_config = ConfigDict(strict=True, extra="forbid", frozen=True)

    investigation_id: Id


class GraphState(TypedDict):
    """Complete state passed between graph nodes."""

    investigation_id: str
    phase: GraphPhase
    foundation_check_passed: bool


class GraphUpdate(TypedDict, total=False):
    """Partial state updates returned by individual nodes."""

    phase: GraphPhase
    foundation_check_passed: bool


class GraphExecutionResult(BaseModel):
    """Validated output from a completed foundation execution."""

    model_config = ConfigDict(strict=True, extra="forbid", frozen=True)

    investigation_id: Id
    phase: Literal["finished"]
    foundation_check_passed: bool

    @model_validator(mode="after")
    def require_successful_foundation_check(self) -> "GraphExecutionResult":
        if not self.foundation_check_passed:
            raise ValueError("The foundation check must pass before completion.")
        return self


def create_initial_state(graph_input: GraphInput) -> GraphState:
    """Create independent initial state for each invocation."""

    return {
        "investigation_id": graph_input.investigation_id,
        "phase": "pending",
        "foundation_check_passed": False,
    }
