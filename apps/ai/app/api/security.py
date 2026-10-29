"""Authentication for protected internal AI endpoints."""

import hmac
import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.dependencies import get_settings
from app.core.config import Settings
from app.core.logging import get_logger, log_event

bearer_scheme = HTTPBearer(auto_error=False)


def require_internal_service(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    """Authenticate the calling backend using a shared bearer secret."""

    logger = get_logger()
    configured_secret = settings.internal_api_key
    expected = (
        configured_secret.get_secret_value().strip()
        if configured_secret is not None
        else ""
    )

    if not expected:
        log_event(
            logger,
            logging.ERROR,
            "internal_authentication_unavailable",
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Internal service authentication is unavailable.",
        )

    if (
        credentials is None
        or credentials.scheme.lower() != "bearer"
        or not hmac.compare_digest(credentials.credentials, expected)
    ):
        log_event(
            logger,
            logging.WARNING,
            "internal_authentication_rejected",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal service credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
