# Services API

Base path: `/organizations/:organizationId/services`. Request/response shapes
are defined in `packages/contracts/src/services/service.schema.ts`.

Every route here requires an authenticated session (`401 UNAUTHENTICATED`
otherwise), **and** that the user has a `Membership` in the organization
named by `:organizationId` (`404 ORGANIZATION_NOT_FOUND` otherwise —
deliberately a bare 404, not 403: tenant isolation means never confirming
an organization exists to someone who has no business knowing about it).
Creating, updating, and deleting a service additionally require the `ADMIN`
role (`403 FORBIDDEN` otherwise); viewing is open to any member regardless
of role.

A service may optionally belong to a `Team` via `teamId`. When `teamId` is
given on create or update, it is validated against `:organizationId` the
same way `:teamId` itself is on the Teams API — a team that doesn't exist,
or that belongs to a different organization, is reported as
`404 TEAM_NOT_FOUND` rather than silently creating a cross-tenant reference.

`healthStatus` and `currentVersion` are server-managed operational state —
they are returned on every response but are **not** accepted in
create/update request bodies. They exist for a future deploy/monitoring
integration to populate; there is no manual-write path for them yet.

---

## POST /organizations/:organizationId/services

**Role required:** `ADMIN`

**Request body** (`CreateServiceRequestSchema`):

```json
{
  "name": "Checkout API",
  "environment": "production",
  "teamId": "..."
}
```

`name` — 2–100 chars. `environment` — 1–50 chars (free text, e.g.
`production`, `staging`). `teamId` is optional; omit it to create an
unassigned service.

**Success — `201`**

```json
{
  "id": "...",
  "organizationId": "...",
  "teamId": null,
  "name": "...",
  "environment": "...",
  "healthStatus": "UNKNOWN",
  "currentVersion": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Errors**

| Status | Code                 | Meaning                                                    |
| ------ | -------------------- | ----------------------------------------------------------- |
| 400    | (validation)          | malformed body                                             |
| 404    | `TEAM_NOT_FOUND`      | `teamId` was given but doesn't exist in this organization   |
| 409    | `SERVICE_NAME_TAKEN`  | another service in this organization already has this name |

---

## GET /organizations/:organizationId/services

**Role required:** none beyond membership — any role can list.

**Query:** `?page=1&limit=10` (`PaginationQuerySchema` — `page` defaults to
1, `limit` defaults to 10, max 100).

**Success — `200`**

```json
{
  "items": [
    {
      "id": "...",
      "organizationId": "...",
      "teamId": null,
      "name": "...",
      "environment": "...",
      "healthStatus": "UNKNOWN",
      "currentVersion": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "page": 1,
  "limit": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

**Errors**

| Status | Code              | Meaning                         |
| ------ | ----------------- | -------------------------------- |
| 400    | `INVALID_REQUEST` | malformed pagination parameters |

---

## GET /organizations/:organizationId/services/:serviceId

**Role required:** none beyond membership — any role can view.

**Success — `200`**: same shape as a single item from the list response above.

**Errors**

| Status | Code                | Meaning                                                                                                                             |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 404    | `SERVICE_NOT_FOUND` | no service with this ID exists in this organization (also returned if the service exists but belongs to a _different_ organization) |

---

## PATCH /organizations/:organizationId/services/:serviceId

**Role required:** `ADMIN`

**Request body** (`UpdateServiceRequestSchema`): same shape and validation
as create — `name`, `environment`, and optional `teamId` (re-validated
against `:organizationId` whenever it's provided, including on reassignment).

**Success — `200`**: the updated service, same shape as `GET`.

**Errors:** same as `POST` (`TEAM_NOT_FOUND`, `SERVICE_NAME_TAKEN`) plus
`404 SERVICE_NOT_FOUND` (same meaning as `GET`).

---

## DELETE /organizations/:organizationId/services/:serviceId

**Role required:** `ADMIN`

**Success — `200`**: `{ "deleted": true }`

**Errors**

| Status | Code                | Meaning               |
| ------ | ------------------- | ---------------------- |
| 404    | `SERVICE_NOT_FOUND` | same meaning as `GET` |
