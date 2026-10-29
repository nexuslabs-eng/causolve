# AI Service

Python and FastAPI service AI functionality, with Pydantic
contracts, a Gemini provider, and LangGraph installed for future orchestration.

## Responsibilities

- Accept internal investigation requests from Express.
- Validate request and response shapes against the shared contracts.
- Keep model-provider interaction behind the `AIProvider` interface.
- Eventually own investigation reasoning and LangGraph orchestration.

Express owns authentication, tenant isolation, RBAC, persistence, approvals,
and remediation authorization. The React application communicates with
Express, not directly with this service.

## Structure

```text
app/
|-- api/         Internal HTTP routes and scaffold response
|-- contracts/   Pydantic models mirroring shared Zod contracts
|-- core/        Validated configuration and application errors
|-- graph/       Internal state, deterministic workflow, and async runner
|-- providers/   Provider interface and Gemini implementation
`-- main.py      FastAPI application factory

scripts/         Export Python samples for Zod compatibility checks
tests/           API, contract, configuration, provider, and smoke tests
```

The deterministic foundation workflow executes:

`START → initialize → check_foundation → END`

The provider-enabled investigation workflow executes:

`START → initialize → check_foundation → verify_provider → END`

`GraphRunner` provides provider-independent foundation execution.
`ProviderGraphRunner` adds asynchronous provider verification through
runtime context.

`POST /investigations/run` now executes the provider-enabled workflow.
It does not generate hypotheses, interpret evidence, or propose
recommendations. Successful provider verification returns a `DEGRADED`
result until investigation intelligence is implemented.

Execution remains in memory without checkpoint persistence. An
interrupted run cannot resume after a process restart.

## Development

Requires Python 3.13, uv, and the repository's pinned pnpm version.

Run all commands below from the repository root:

```powershell
uv python install 3.13
uv sync --locked --directory apps/ai --group dev
```

For initial setup, copy the environment template and configure local values.
Preserve an existing `.env`; never commit credentials.

```powershell
Copy-Item apps/ai/.env.example apps/ai/.env
pnpm ai:dev
```

The service runs at `http://127.0.0.1:8000`. Interactive documentation is
available at `/docs` when `AI_DOCS_ENABLED=true`.

The root pnpm scripts delegate Python commands to uv. Python dependencies
remain managed through `apps/ai/pyproject.toml` and `apps/ai/uv.lock`.

## Configuration

All variables use the `AI_` prefix.

| Variable suffix | Purpose |
|---|---|
| `APP_ENV` | `development`, `test`, or `production` |
| `DOCS_ENABLED` | Enable `/docs` and `/openapi.json`; defaults to false |
| `LOG_LEVEL` | `DEBUG`, `INFO`, `WARNING`, `ERROR`, or `CRITICAL` |
| `INTERNAL_API_KEY` | Shared backend-to-AI bearer secret |
| `GEMINI_API_KEY` | Provider credential; keep blank in `.env.example` |
| `GEMINI_MODEL` | Gemini model identifier |
| `GEMINI_TIMEOUT_SECONDS` | Request timeout, 1–300 seconds; defaults to 60 |
| `EXECUTION_TIMEOUT_SECONDS` | Overall graph deadline; must exceed provider timeout |

Settings load from `apps/ai/.env`, with process environment variables taking
precedence. Restart the service after changing configuration.

Gemini credentials are required only for provider use, not normal tests
or scaffold endpoints.

## Verification

Run from the repository root:

```text
pnpm ai:check
```

Apply safe lint fixes and formatting:

```text
pnpm ai:lint --fix
pnpm ai:format
```

The live Gemini test requires local credentials and makes a real API request:

```text
pnpm ai:smoke
```

Success verifies the complete FastAPI, LangGraph, and Gemini path. Normal
tests skip live tests, and ordinary CI excludes them.

## Shared Contracts

`packages/contracts/src/internal-ai` defines the canonical Zod schemas.
Pydantic mirrors their JSON shapes using snake_case Python attributes and
camelCase JSON aliases.

Run `pnpm ai:contracts` from the repository root to verify shared fixtures
and Python serialization.

The AI workflow in `.github/workflows/ai.yml` checks locked dependencies,
Ruff, deterministic tests, LangGraph imports, and contract compatibility.

## Current Scope

- `POST /investigations/run` executes initialization, the foundation
  check, and asynchronous provider verification through LangGraph.
- Successful provider verification returns `DEGRADED` because actual
  investigation intelligence remains unimplemented.
- Responses contain empty proposal collections and no recommendation.
- Provider and execution failures return controlled `FAILED` results.
- Invalid requests return HTTP 422 before opening a provider.
- Normal automated tests inject fake providers and make no Gemini calls.
- `POST /investigations/run` requires internal bearer authentication.
- `GET /health` remains public for platform health checks.

Hypothesis generation, evidence collection, contradiction evaluation,
progressive degradation, recommendations, remediation reasoning, and
production deployment belong to later milestones.

## Internal Authentication

`POST /investigations/run` requires a bearer token shared only between the
Express backend and AI service:

```text
Authorization: Bearer <AI_INTERNAL_API_KEY>
```

The AI service does not perform user authentication, tenant authorization,
RBAC, persistence, or remediation authorization. Those remain backend
responsibilities.

## Execution Lifecycle

The current graph is a short, linear request-response workflow. It does not
pause for human input or resume across requests, so no checkpointer is
configured for the initial deployment.

A process restart can interrupt an active execution. Durable checkpointing
will be introduced only when workflows require pause, resume, or recovery
across processes.

## Logging

The service emits structured JSON logs for authentication rejection,
execution start, completion, timeout, and provider failure. Logs contain
request IDs, investigation IDs, outcome categories, and durations. They do
not contain credentials, prompts, provider responses, incident descriptions,
or exception messages.
