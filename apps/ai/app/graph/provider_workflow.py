"""Minimal provider-enabled workflow without investigation intelligence."""

import asyncio
from typing import Literal

from langgraph.errors import NodeCancelledError
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime

from app.core.exceptions import ProviderConfigurationError, ProviderError
from app.graph.context import GraphContext
from app.graph.nodes import check_foundation, initialize
from app.graph.state import (
    GraphExecutionResult,
    GraphInput,
    GraphState,
    create_initial_state,
)
from app.providers.base import AIProvider

PROVIDER_ACKNOWLEDGEMENT = "GRAPH_PROVIDER_OK"
PROVIDER_PROMPT = (
    "This is an orchestration connectivity check. "
    f"Respond with exactly {PROVIDER_ACKNOWLEDGEMENT} "
    "and no additional text."
)


class ProviderGraphState(GraphState):
    provider_verified: bool


class ProviderGraphResult(GraphExecutionResult):
    provider_verified: Literal[True]


async def verify_provider(
    state: ProviderGraphState,
    runtime: Runtime[GraphContext],
) -> dict[str, bool]:
    """Verify provider execution without generating investigation content."""

    if state["phase"] != "finished" or not state["foundation_check_passed"]:
        raise ValueError("Provider verification requires a completed foundation.")

    provider = runtime.context.provider
    if provider is None:
        raise ProviderConfigurationError("A graph provider is required.")

    response = await provider.generate(PROVIDER_PROMPT)

    if not isinstance(response, str) or response.strip() != PROVIDER_ACKNOWLEDGEMENT:
        raise ProviderError(
            "response",
            "The provider returned an invalid verification response.",
        )

    return {"provider_verified": True}


def build_provider_workflow() -> StateGraph[ProviderGraphState, GraphContext]:
    workflow = StateGraph(ProviderGraphState, context_schema=GraphContext)

    workflow.add_node("initialize", initialize)
    workflow.add_node("check_foundation", check_foundation)
    workflow.add_node("verify_provider", verify_provider)

    workflow.add_edge(START, "initialize")
    workflow.add_edge("initialize", "check_foundation")
    workflow.add_edge("check_foundation", "verify_provider")
    workflow.add_edge("verify_provider", END)

    return workflow


class ProviderGraphRunner:
    """Reuse a compiled graph with invocation-specific provider context."""

    def __init__(self) -> None:
        self._workflow = build_provider_workflow().compile()

    async def run(
        self,
        graph_input: GraphInput,
        *,
        provider: AIProvider,
    ) -> ProviderGraphResult:
        initial = create_initial_state(graph_input)
        state: ProviderGraphState = {
            "investigation_id": initial["investigation_id"],
            "phase": initial["phase"],
            "foundation_check_passed": initial["foundation_check_passed"],
            "provider_verified": False,
        }

        try:
            output = await self._workflow.ainvoke(
                state,
                context=GraphContext(provider=provider),
                config={"recursion_limit": 10},
            )
        except NodeCancelledError:
            raise asyncio.CancelledError() from None

        return ProviderGraphResult.model_validate(output)
