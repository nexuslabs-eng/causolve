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
|-- providers/   Provider interface and Gemini implementation
`-- main.py      FastAPI application factory

scripts/         Export Python samples for Zod compatibility checks
tests/           API, contract, configuration, provider, and smoke tests
```

Future graph state and orchestration will live in `app/graph/`. No
investigation graph is implemented yet.

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
| `GEMINI_API_KEY` | Provider credential; keep blank in `.env.example` |
| `GEMINI_MODEL` | Gemini model identifier |
| `GEMINI_TIMEOUT_SECONDS` | Request timeout, 1–300 seconds; defaults to 60 |

Settings load from `apps/ai/.env`, with process environment variables taking
precedence. Restart the service after changing configuration.

Gemini credentials are required only for provider use, not normal tests
or scaffold endpoints.

## Verification

Run from the repository root:

```powershell
pnpm ai:test
pnpm ai:lint
pnpm ai:format:check
```

Apply safe lint fixes and formatting:

```powershell
pnpm ai:lint --fix
pnpm ai:format
```

The live Gemini test requires local credentials and makes a real API request:

```powershell
pnpm ai:smoke
```

Success returns `AI_PROVIDER_OK`. Normal tests skip this test,
and ordinary CI excludes it.

## Shared Contracts

`packages/contracts/src/internal-ai` defines the canonical Zod schemas.
Pydantic mirrors their JSON shapes using snake_case Python attributes and
camelCase JSON aliases.

From the repository root, verify shared fixtures and Python serialization:

```powershell
pnpm --filter contracts exec tsc --noEmit
$contractOutput = Join-Path $env:TEMP 'ai-contract-output.json'
uv run --locked --directory apps/ai python -m scripts.export_contract_samples $contractOutput
pnpm --filter contracts test:ai-contracts $contractOutput
```

The AI workflow in `.github/workflows/ai.yml` checks locked dependencies,
Ruff, deterministic tests, LangGraph imports, and contract compatibility.

## Current Scope

- `GET /health` returns HTTP 200 with `{"status":"ok"}`.
- `POST /investigations/run` returns a deterministic scaffold result:
  HTTP 200, status `FAILED`, and an explicit not-implemented message.
- Gemini connectivity has been verified through a real smoke-test response.
  External availability can vary.
- LangGraph is installed; its workflow implementation remains deferred.

Hypothesis generation, evidence collection, contradiction evaluation,
progressive degradation, recommendations, remediation reasoning, and
production deployment belong to later milestones.