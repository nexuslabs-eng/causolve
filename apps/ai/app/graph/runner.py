"""Reusable asynchronous execution interface for the foundation graph."""

from app.graph.context import GraphContext
from app.graph.state import GraphExecutionResult, GraphInput, create_initial_state
from app.graph.workflow import build_workflow
from app.providers.base import AIProvider

GRAPH_RECURSION_LIMIT = 10


class GraphRunner:
    """Execute independent runs using one compiled workflow."""

    def __init__(self) -> None:
        self._workflow = build_workflow().compile()

    async def run(
        self,
        graph_input: GraphInput,
        *,
        provider: AIProvider | None = None,
    ) -> GraphExecutionResult:
        """Run the foundation and validate its completed state."""

        initial_state = create_initial_state(graph_input)
        context = GraphContext(provider=provider)

        final_state = await self._workflow.ainvoke(
            initial_state,
            context=context,
            config={"recursion_limit": GRAPH_RECURSION_LIMIT},
        )

        return GraphExecutionResult.model_validate(final_state)
