"""FastAPI application entry point."""

from fastapi import FastAPI

from app.api.investigations import router as investigations_router
from app.core.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create an application using validated settings."""

    resolved_settings = settings if settings is not None else Settings()

    application = FastAPI(
        title="AI Service",
        version="0.1.0",
        docs_url="/docs" if resolved_settings.docs_enabled else None,
        redoc_url=None,
        openapi_url="/openapi.json" if resolved_settings.docs_enabled else None,
    )
    application.state.settings = resolved_settings

    application.include_router(investigations_router)

    @application.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return application
