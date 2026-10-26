# Causolve Frontend

The Causolve frontend is a React and TypeScript PWA for the public marketing experience, authentication and onboarding, and the authenticated incident-response workspace.

## Responsibilities

- Render the marketing site and product interface.
- Manage client-only UI state with Zustand.
- Manage server state with TanStack Query.
- Validate API requests and responses with the shared `contracts` package.
- Communicate with the backend through the shared Axios client.
- Receive deterministic development responses through MSW.

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

Feature-specific code stays inside `features/`. Shared visual primitives belong in `components/`, while API and query logic remains separate from page components.

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
```

Set `VITE_API_URL` to override the default API origin of `http://localhost:3000`.

## Current Scope

The frontend currently includes the marketing page, login, signup and onboarding, email verification, workspace setup, profile setup, password recovery, session-aware routing, global loading and error states, PWA prompts, and a temporary Command Center data-flow screen.
