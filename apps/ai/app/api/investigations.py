"""Execute the protected provider-enabled investigation workflow."""

import asyncio
import logging
from time import perf_counter
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends

from app.api.dependencies import (
    ProviderFactory,
    get_provider_factory,
    get_provider_graph_runner,
    get_settings,
)
from app.api.security import require_internal_service
from app.contracts.investigation import (
    AIInvestigationResult,
    StartAIInvestigationRequest,
)
from app.core.config import Settings
from app.core.exceptions import ProviderConfigurationError, ProviderError
from app.core.logging import get_logger, log_event
from app.graph.provider_workflow import ProviderGraphRunner
from app.graph.state import GraphInput

router = APIRouter()

FOUNDATION_ONLY_MESSAGE = (
    "Graph and provider verification succeeded. "
    "Investigation intelligence is not implemented."
)


def build_execution_result(
    investigation_id: str,
    *,
    status: Literal["DEGRADED", "FAILED"],
    message: str,
) -> AIInvestigationResult:
    """Keep incomplete execution explicit without fabricating proposals."""

    return AIInvestigationResult.model_validate(
        {
            "investigationId": investigation_id,
            "status": status,
            "hypothesisProposals": [],
            "evidenceInterpretations": [],
            "recommendationProposal": None,
            "error": message,
        }
    )


def elapsed_milliseconds(started_at: float) -> int:
    return round((perf_counter() - started_at) * 1000)


@router.post(
    "/investigations/run",
    response_model=AIInvestigationResult,
    response_model_by_alias=True,
)
async def run_investigation(
    request: StartAIInvestigationRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    runner: Annotated[ProviderGraphRunner, Depends(get_provider_graph_runner)],
    provider_factory: Annotated[ProviderFactory, Depends(get_provider_factory)],
    _: Annotated[None, Depends(require_internal_service)],
) -> AIInvestigationResult:
    logger = get_logger()
    request_id = uuid4().hex
    started_at = perf_counter()

    log_event(
        logger,
        logging.INFO,
        "investigation_execution_started",
        request_id=request_id,
        investigation_id=request.investigation_id,
    )

    try:
        async with asyncio.timeout(settings.execution_timeout_seconds):
            async with provider_factory(settings) as provider:
                execution = await runner.run(
                    GraphInput(investigation_id=request.investigation_id),
                    provider=provider,
                )

        if execution.investigation_id != request.investigation_id:
            raise ValueError(
                "Graph execution returned an unexpected investigation identifier."
            )

    except ProviderConfigurationError:
        log_event(
            logger,
            logging.ERROR,
            "investigation_execution_failed",
            request_id=request_id,
            investigation_id=request.investigation_id,
            failure_kind="provider_configuration",
            duration_ms=elapsed_milliseconds(started_at),
        )
        return build_execution_result(
            request.investigation_id,
            status="FAILED",
            message="AI provider configuration is unavailable.",
        )
    except ProviderError as error:
        log_event(
            logger,
            logging.WARNING,
            "investigation_execution_failed",
            request_id=request_id,
            investigation_id=request.investigation_id,
            failure_kind=error.kind,
            duration_ms=elapsed_milliseconds(started_at),
        )
        return build_execution_result(
            request.investigation_id,
            status="FAILED",
            message=f"AI provider execution failed ({error.kind}).",
        )
    except TimeoutError:
        log_event(
            logger,
            logging.WARNING,
            "investigation_execution_failed",
            request_id=request_id,
            investigation_id=request.investigation_id,
            failure_kind="execution_timeout",
            duration_ms=elapsed_milliseconds(started_at),
        )
        return build_execution_result(
            request.investigation_id,
            status="FAILED",
            message="Graph execution timed out.",
        )
    except Exception as error:
        log_event(
            logger,
            logging.ERROR,
            "investigation_execution_failed",
            request_id=request_id,
            investigation_id=request.investigation_id,
            failure_kind="unexpected",
            exception_type=type(error).__name__,
            duration_ms=elapsed_milliseconds(started_at),
        )
        return build_execution_result(
            request.investigation_id,
            status="FAILED",
            message="Unexpected graph execution failure.",
        )

    log_event(
        logger,
        logging.INFO,
        "investigation_execution_completed",
        request_id=request_id,
        investigation_id=request.investigation_id,
        outcome="degraded",
        duration_ms=elapsed_milliseconds(started_at),
    )

    return build_execution_result(
        request.investigation_id,
        status="DEGRADED",
        message=FOUNDATION_ONLY_MESSAGE,
    )
