"""Tests for structured logging and sensitive-detail omission."""

import json
import logging
import sys

from app.core.logging import JsonFormatter


def test_json_formatter_includes_approved_event_metadata() -> None:
    record = logging.LogRecord(
        name="causolve.ai",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="investigation_execution_completed",
        args=(),
        exc_info=None,
    )
    record.event_data = {
        "request_id": "request-123",
        "investigation_id": "11111111-1111-4111-8111-111111111111",
        "duration_ms": 25,
    }

    output = json.loads(JsonFormatter().format(record))

    assert output["event"] == "investigation_execution_completed"
    assert output["request_id"] == "request-123"
    assert output["duration_ms"] == 25
    assert "timestamp" in output


def test_json_formatter_omits_exception_details() -> None:
    try:
        raise RuntimeError("sensitive provider response")
    except RuntimeError:
        exception_info = sys.exc_info()

    record = logging.LogRecord(
        name="causolve.ai",
        level=logging.ERROR,
        pathname=__file__,
        lineno=1,
        msg="investigation_execution_failed",
        args=(),
        exc_info=exception_info,
    )
    record.event_data = {
        "failure_kind": "unexpected",
        "exception_type": "RuntimeError",
    }

    formatted = JsonFormatter().format(record)

    assert "sensitive provider response" not in formatted
    assert json.loads(formatted)["exception_type"] == "RuntimeError"
