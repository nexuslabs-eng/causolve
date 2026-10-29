"""Structured logging without investigation payloads or credentials."""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

LOGGER_NAME = "causolve.ai"


class JsonFormatter(logging.Formatter):
    """Serialize approved logging fields as one JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
        }

        event_data = getattr(record, "event_data", None)
        if isinstance(event_data, dict):
            payload.update(event_data)

        return json.dumps(payload, separators=(",", ":"), default=str)


def configure_logging(level: str) -> logging.Logger:
    """Configure the dedicated AI logger once."""

    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(level)
    logger.propagate = False

    if not any(
        getattr(handler, "_causolve_json_handler", False) for handler in logger.handlers
    ):
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        handler._causolve_json_handler = True  # type: ignore[attr-defined]
        logger.addHandler(handler)

    return logger


def get_logger() -> logging.Logger:
    return logging.getLogger(LOGGER_NAME)


def log_event(
    logger: logging.Logger,
    level: int,
    event: str,
    **fields: object,
) -> None:
    """Log explicitly supplied metadata without request or prompt bodies."""

    logger.log(level, event, extra={"event_data": fields})
