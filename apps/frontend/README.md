# Causolve Frontend

The Causolve frontend is a React and TypeScript PWA for the public marketing experience, authentication and onboarding, and the authenticated incident-response workspace.

## Responsibilities

- Render the marketing site and product interface.
- Manage client-only UI state with Zustand.
- Manage server state with TanStack Query.
- Validate API requests and responses with direct imports from the shared
  `contracts` package.
- Communicate with the backend through the shared Axios client.
- Receive deterministic development responses through MSW.
- Render personal and workspace settings with server-backed forms,
  loading/error states, shared validation, and disabled fallback states.

## Structure

```text
src/
|-- app/          Application runtime, router, and route guards
|-- components/   Shared UI, layout, loading, PWA, and theme components
|-- features/     Feature-owned pages, components, APIs, hooks, and queries
|-- layouts/      Marketing and authentication page composition
|-- lib/          API client, Query client, and shared utilities
|-- mocks/        MSW handlers, endpoint simulations, and fixtures
|-- stores/       Client-only Zustand state
|-- styles/       Global styles and theme variables
`-- test/         Shared Vitest setup
```

Feature-specific code stays inside `features/`. Shared visual primitives belong in `components/`, while API and query logic remains separate from page components. Settings routes are lazy-loaded so their pages, queries, and schemas are fetched only when the route is opened.

## Authentication

Authentication uses an `HttpOnly` cookie session. The frontend never reads or stores the session token directly; it requests `/auth/session` and uses route loaders to direct anonymous, onboarding, and authenticated users.

MSW currently implements the authentication and onboarding endpoints during development. When the backend is ready, MSW can be disabled without changing the feature API functions. Google and GitHub authentication remain disabled until backend OAuth endpoints are available.

## Development

Run commands from the repository root:

```bash
pnpm --filter frontend dev
pnpm --filter frontend test
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm check
```

Set `VITE_API_URL` to override the default API origin of `http://localhost:3000`.

## Current Scope

The frontend currently includes the marketing page, login, signup and
onboarding, email verification, workspace setup, profile setup, password
recovery, session-aware routing, global loading and error states, PWA
prompts, and the authenticated workspace.

The workspace includes personal settings for profile, account security,
notifications, and preferences, plus workspace settings for general
configuration, members and roles, teams, investigation configuration, AI
and evidence policies, approvals and remediation, audit controls, and
integration cards. Personal and workspace settings are organized as
lazy-loaded routes and use TanStack Query, React Hook Form, Zod contracts,
and reusable loading/error UI.

Integrations are currently presentation-only. Their cards and disabled
connect controls are ready for the later integration implementation.
