"""Build the minimal orchestration workflow."""

from langgraph.graph import END, START, StateGraph

from app.graph.context import GraphContext
from app.graph.nodes import check_foundation, initialize
from app.graph.state import GraphState


def build_workflow() -> StateGraph[GraphState, GraphContext]:
    """Create a fresh graph builder without external resources."""

    workflow = StateGraph(GraphState, context_schema=GraphContext)

    workflow.add_node("initialize", initialize)
    workflow.add_node("check_foundation", check_foundation)

    workflow.add_edge(START, "initialize")
    workflow.add_edge("initialize", "check_foundation")
    workflow.add_edge("check_foundation", END)

    return workflow
