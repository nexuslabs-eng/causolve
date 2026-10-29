"""Workflow execution, dependency injection, and isolation tests."""

import asyncio
from unittest.mock import AsyncMock

import pytest
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime

from app.graph import GraphInput, GraphRunner
from app.graph.context import GraphContext
from app.graph.state import GraphState, GraphUpdate, create_initial_state
from app.graph.workflow import build_workflow

FIRST_ID = "11111111-1111-4111-8111-111111111111"
SECOND_ID = "22222222-2222-4222-8222-222222222222"


class FakeProvider:
    def __init__(self) -> None:
        self.generate = AsyncMock(return_value="TEST_PROVIDER_OK")


def test_runner_completes_foundation_workflow() -> None:
    runner = GraphRunner()

    result = asyncio.run(runner.run(GraphInput(investigation_id=FIRST_ID)))

    assert result.model_dump() == {
        "investigation_id": FIRST_ID,
        "phase": "finished",
        "foundation_check_passed": True,
    }


def test_workflow_executes_nodes_in_order() -> None:
    async def execute() -> list[dict]:
        workflow = build_workflow().compile()
        state = create_initial_state(GraphInput(investigation_id=FIRST_ID))

        updates = []
        async for update in workflow.astream(
            state,
            context=GraphContext(),
            stream_mode="updates",
        ):
            updates.append(update)

        return updates

    updates = asyncio.run(execute())

    assert updates == [
        {
            "initialize": {
                "phase": "initialized",
                "foundation_check_passed": False,
            }
        },
        {
            "check_foundation": {
                "phase": "finished",
                "foundation_check_passed": True,
            }
        },
    ]


def test_repeated_execution_is_deterministic() -> None:
    async def execute() -> None:
        runner = GraphRunner()
        graph_input = GraphInput(investigation_id=FIRST_ID)

        first = await runner.run(graph_input)
        second = await runner.run(graph_input)

        assert first == second

    asyncio.run(execute())


def test_concurrent_executions_keep_state_isolated() -> None:
    async def execute() -> None:
        runner = GraphRunner()

        first, second = await asyncio.gather(
            runner.run(GraphInput(investigation_id=FIRST_ID)),
            runner.run(GraphInput(investigation_id=SECOND_ID)),
        )

        assert first.investigation_id == FIRST_ID
        assert second.investigation_id == SECOND_ID
        assert first.foundation_check_passed is True
        assert second.foundation_check_passed is True

    asyncio.run(execute())


def test_foundation_does_not_call_injected_provider() -> None:
    provider = FakeProvider()
    runner = GraphRunner()

    result = asyncio.run(
        runner.run(
            GraphInput(investigation_id=FIRST_ID),
            provider=provider,
        )
    )

    assert result.foundation_check_passed is True
    provider.generate.assert_not_called()


def test_runtime_context_keeps_providers_separate() -> None:
    first_provider = FakeProvider()
    second_provider = FakeProvider()
    observed = {}

    async def inspect_context(
        state: GraphState,
        runtime: Runtime[GraphContext],
    ) -> GraphUpdate:
        observed[state["investigation_id"]] = runtime.context.provider

        return {
            "phase": "finished",
            "foundation_check_passed": True,
        }

    builder = StateGraph(GraphState, context_schema=GraphContext)
    builder.add_node("inspect_context", inspect_context)
    builder.add_edge(START, "inspect_context")
    builder.add_edge("inspect_context", END)
    workflow = builder.compile()

    async def execute() -> None:
        await asyncio.gather(
            workflow.ainvoke(
                create_initial_state(GraphInput(investigation_id=FIRST_ID)),
                context=GraphContext(provider=first_provider),
            ),
            workflow.ainvoke(
                create_initial_state(GraphInput(investigation_id=SECOND_ID)),
                context=GraphContext(provider=second_provider),
            ),
        )

    asyncio.run(execute())

    assert observed[FIRST_ID] is first_provider
    assert observed[SECOND_ID] is second_provider
    first_provider.generate.assert_not_called()
    second_provider.generate.assert_not_called()


def test_runner_propagates_unexpected_execution_errors(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    failure = RuntimeError("Synthetic graph failure")

    class FailingWorkflow:
        async def ainvoke(self, *args: object, **kwargs: object) -> dict:
            raise failure

    class FailingBuilder:
        def compile(self) -> FailingWorkflow:
            return FailingWorkflow()

    monkeypatch.setattr(
        "app.graph.runner.build_workflow",
        lambda: FailingBuilder(),
    )
    runner = GraphRunner()

    with pytest.raises(RuntimeError, match="Synthetic graph failure") as error:
        asyncio.run(runner.run(GraphInput(investigation_id=FIRST_ID)))

    assert error.value is failure
