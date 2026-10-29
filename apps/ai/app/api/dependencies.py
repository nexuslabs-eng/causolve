"""Dependencies for internal investigation execution."""

from collections.abc import Callable
from contextlib import AbstractAsyncContextManager

from fastapi import Request

from app.core.config import Settings
from app.graph.provider_workflow import ProviderGraphRunner
from app.providers.base import AIProvider
from app.providers.gemini import open_gemini_provider

ProviderFactory = Callable[
    [Settings],
    AbstractAsyncContextManager[AIProvider],
]


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_provider_graph_runner(request: Request) -> ProviderGraphRunner:
    return request.app.state.provider_graph_runner


def get_provider_factory() -> ProviderFactory:
    return open_gemini_provider
