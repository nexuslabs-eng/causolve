# Causolve

Causolve is an evidence-aware incident investigation and response
platform for engineering teams. It is designed for complex failures where
signals conflict, evidence quality varies, and critical diagnostic
capabilities may become unavailable.

Instead of treating AI confidence as the final answer, Causolve
maintains competing hypotheses, evaluates supporting and contradictory
evidence, tracks investigation integrity, and requires human
authorization before consequential remediation.

> **AI recommends. Humans authorize. Causolve enforces.**

## Product Direction

``` text
Incident
  ↓
Investigation
  ↓
Competing Hypotheses
  ↓
Evidence Collection
  ↓
Contradiction Analysis
  ↓
Investigation Integrity
  ↓
Recommendation
  ↓
RBAC + Human Approval
  ↓
Remediation
  ↓
Verification
  ↓
Resolution + Postmortem
```

Causolve also uses **progressive degradation** so an investigation can
continue safely when evidence sources, AI services, or automation
capabilities become unavailable.

## Key Capabilities

-   Incident lifecycle and timeline management
-   AI-assisted investigation with LangGraph
-   Competing root-cause hypotheses
-   Asymmetric evidence contradiction analysis
-   Evidence provenance and independence tracking
-   Investigation integrity and evidence coverage
-   Progressive degradation during tool or service failures
-   RBAC and human-controlled remediation
-   Recovery verification
-   Postmortem generation and audit history
-   Real-time investigation updates through SSE
-   Installable React PWA

## Architecture

Causolve is developed as three independently testable domains connected
through explicit contracts.

``` text
React + TypeScript PWA
        │
     REST / SSE
        │
        ▼
Node.js + Express API 
        │
        ├── PostgreSQL + Prisma ORM
        │
        ▼
Python + FastAPI + LangGraph
```

### Frontend

React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, Radix
UI, Zustand, TanStack Query, Axios, Zod, React Hook Form, Recharts,
vite-plugin-pwa, Vitest, React Testing Library, Playwright, and MSW.

### Backend

Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Zod, server-side
RBAC, tenant isolation, and Server-Sent Events.

### AI Service

Python, FastAPI, LangGraph, Pydantic, and Gemini through a provider
abstraction.

## MVP

The MVP uses deterministic simulated operational data so the complete
incident workflow can be developed and tested end to end.

The flagship scenario intentionally begins with a misleading deployment
hypothesis. Strong contradictory evidence causes Causolve to revise its
reasoning toward an external provider failure. A diagnostic tool then
fails, triggering progressive degradation and stricter remediation
approval before recovery is verified.

## Repository

```text
causolve/
|-- apps/
|   |-- frontend/     React and TypeScript PWA
|   |-- backend/      Express domain API
|   `-- ai/           Python AI service
|-- packages/
|   |-- contracts/    Shared TypeScript and Zod schemas
|   `-- database/     Shared Prisma database package
|-- docs/            Product and engineering documentation
`-- .github/         CI workflows
```

## Development

Use Node.js 24 and the pnpm version declared in the root `package.json`.
The AI service additionally requires uv and Python 3.13.

Install JavaScript workspace dependencies from the repository root:

```powershell
pnpm install --frozen-lockfile
```

Follow each domain README for environment configuration and initial setup.
After setup, start the required domains in separate terminals:

```powershell
pnpm --filter frontend dev
pnpm --filter @causolve/backend dev
pnpm ai:dev
```

Frontend development can use MSW without a running backend. AI scaffold
tests run independently of the backend and database.

## Verification

Common commands, run from the repository root:

```powershell
pnpm --filter frontend test
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter @causolve/backend build

pnpm ai:test
pnpm ai:lint
pnpm ai:format:check
```

The backend `build` command currently performs TypeScript checking.

For AI lint fixes and formatting:

```powershell
pnpm ai:lint --fix
pnpm ai:format
```

`pnpm ai:smoke` explicitly runs a real Gemini request and requires local
provider credentials. It is excluded from ordinary CI.

See the [AI README](apps/ai/README.md#shared-contracts) for the cross-runtime
Zod/Pydantic compatibility checks.

## Documentation

- [Frontend setup and scope](apps/frontend/README.md)
- [Backend setup and responsibilities](apps/backend/README.md)
- [AI setup, configuration, and testing](apps/ai/README.md)
- [Product requirements](docs/product/prd.md)
- [Engineering playbook](docs/engineering/playbook.md)

## Team

- [Samuel](https://github.com/socode-dev): Frontend and AI Engineering
- [Adejare](https://github.com/jar-andreas): Backend and Platform Engineering

## Status

Causolve is under active development. The current focus is the MVP
investigation workflow, shared contracts, product interface, AI
reasoning system, and backend foundation.
