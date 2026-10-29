"""Dependencies supplied separately for each graph invocation."""

from dataclasses import dataclass, field

from app.providers.base import AIProvider


@dataclass(frozen=True, slots=True)
class GraphContext:
    """The caller owns the lifecycle of any supplied provider."""

    provider: AIProvider | None = field(default=None, repr=False)
