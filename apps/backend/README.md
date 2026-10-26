# Causolve Backend API

Domain API for Causolve: incident lifecycle, tenant-scoped persistence,
RBAC, approval/remediation authorization, and the integration surface
between the frontend and the AI service.

See the [root README](../../README.md) and the
[engineering playbook](../../docs/engineering/playbook.md) for full
product and architecture context.

## Responsibilities

- Authentication, organizations, tenant isolation
- Teams + RBAC
- Incident lifecycle + timeline
- Investigation / hypothesis / evidence persistence
- Approval + remediation authorization (AI recommends, only humans approve)
- Verification + postmortem
- Audit logging
- Real-time updates via SSE
- Integration with the FastAPI + LangGraph AI service

## Stack

Node.js, Express, TypeScript, PostgreSQL via `@causolve/database`
(Prisma ORM), Zod schemas via `@causolve/contracts`, Helmet + CORS,
SSE, Vitest + Supertest.

## Structure

```
src/
├── app.ts              Express app wiring (middleware, routes)
├── server.ts           Process entrypoint
├── infrastructure/     DB client, logger, sessions, keys, email, response helpers
├── middleware/         Auth, error handling, request validation
├── modules/            Feature modules — controller + routes per domain (e.g. modules/users)
├── policies/           RBAC / remediation-approval policy logic
└── simulation/         Simulated diagnostic tools / dev-only AI adapters
```

## Getting started

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env   # fill in DATABASE_URL, etc.
pnpm --filter @causolve/backend dev
```

## Environment variables

| Variable       | Purpose                                                  |
| -------------- | --------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL (Neon) connection string, used by `@causolve/database` |
| `PORT`         | HTTP port                                                 |
| `NODE_ENV`     | `development` / `production` / `test`                    |
| `LOG_LEVEL`    | Logger verbosity                                          |
