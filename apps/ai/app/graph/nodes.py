"""Deterministic nodes establishing the graph execution foundation."""

from app.graph.state import GraphState, GraphUpdate


async def initialize(state: GraphState) -> GraphUpdate:
    """Transition fresh invocation state into an initialized state."""

    if state["phase"] != "pending":
        raise ValueError("Initialization requires pending graph state.")

    return {"phase": "initialized", "foundation_check_passed": False}


async def check_foundation(state: GraphState) -> GraphUpdate:
    """Confirm that initialization occurred and finish the foundation run."""

    if state["phase"] != "initialized":
        raise ValueError("The foundation check requires initialized graph state.")

    return {"phase": "finished", "foundation_check_passed": True}
