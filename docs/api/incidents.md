# Incidents API

Base path: `/organizations/:organizationId/incidents`. Request/response
shapes are defined in `packages/contracts/src/incidents/incident.schema.ts`
and `packages/contracts/src/incidents/incident-event.schema.ts`.

Every route here requires an authenticated session (`401 UNAUTHENTICATED`
otherwise), **and** that the user has a `Membership` in the organization
named by `:organizationId` (`404 ORGANIZATION_NOT_FOUND` otherwise —
deliberately a bare 404, not 403: tenant isolation means never confirming
an organization exists to someone who has no business knowing about it).
Creating and updating an incident, and posting a manual timeline note,
additionally require the `ENGINEER` role (`403 FORBIDDEN` otherwise) —
deliberately lower than `ADMIN`, since responding to an incident is
day-to-day engineering work, not an org-structure change. Viewing is open
to any member regardless of role.

## The timeline (`IncidentEvent`)

Every meaningful change to an incident's `status`, `severity`, or
`commanderId` automatically appends an `IncidentEvent` row in the same
transaction as the update — there is no manual step to log a state change.
`POST .../events` exists only for narrative notes that aren't themselves a
field change (e.g. "paged the payments on-call").

`acknowledgedAt` and `resolvedAt` are server-derived and only ever set
once — flipping `status` back and forth afterwards does not overwrite the
original timestamp.

Incident references (`INC-1`, `INC-2`, ...) are generated from an
atomic, per-organization `incidentSequence` counter, so they stay
sequential and collision-free under concurrent creates within the same
organization.

---

## POST /organizations/:organizationId/incidents

**Role required:** `ENGINEER`

**Request body** (`CreateIncidentRequestSchema`):

```json
{
  "serviceId": "...",
  "title": "Checkout API elevated error rate",
  "description": "optional, up to 2000 chars",
  "severity": "HIGH"
}
```

`title` — 3–200 chars. `severity` — one of `LOW`, `MEDIUM`, `HIGH`,
`CRITICAL`. `serviceId` must belong to this organization.

**Success — `201`**

```json
{
  "id": "...",
  "reference": "INC-1",
  "organizationId": "...",
  "serviceId": "...",
  "title": "...",
  "description": null,
  "severity": "HIGH",
  "status": "DETECTED",
  "commanderId": null,
  "startedAt": "...",
  "acknowledgedAt": null,
  "resolvedAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

An `incident.created` event is appended to the timeline as a side effect.

**Errors**

| Status | Code                 | Meaning                                          |
| ------ | -------------------- | ------------------------------------------------- |
| 400    | (validation)         | malformed body                                    |
| 404    | `SERVICE_NOT_FOUND`  | `serviceId` doesn't exist in this organization    |

---

## GET /organizations/:organizationId/incidents

**Role required:** none beyond membership — any role can list.

**Query:** `?page=1&limit=10` (`PaginationQuerySchema` — `page` defaults to
1, `limit` defaults to 10, max 100). Unrecognized query params are
silently ignored rather than rejected.

**Success — `200`**: paginated list, newest `startedAt` first, same item
shape as `POST`'s response.

**Errors**

| Status | Code              | Meaning                         |
| ------ | ----------------- | -------------------------------- |
| 400    | `INVALID_REQUEST` | malformed pagination parameters |

---

## GET /organizations/:organizationId/incidents/:incidentId

**Role required:** none beyond membership — any role can view.

**Success — `200`**: same shape as a single item from the list response above.

**Errors**

| Status | Code                 | Meaning                                                                                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 404    | `INCIDENT_NOT_FOUND` | no incident with this ID exists in this organization (also returned if the incident exists but belongs to a _different_ organization) |

---

## PATCH /organizations/:organizationId/incidents/:incidentId

**Role required:** `ENGINEER`

**Request body** (`UpdateIncidentRequestSchema`) — all fields optional,
only the ones present are changed:

```json
{
  "status": "ACKNOWLEDGED",
  "severity": "CRITICAL",
  "commanderId": "..."
}
```

`commanderId` is validated against `:organizationId` whenever provided
(it must belong to a member of this organization); pass `null` to
unassign the current commander.

**Success — `200`**: the updated incident, same shape as `GET`. Each
changed field (`status`, `severity`, `commanderId`) appends its own
`IncidentEvent` to the timeline (`incident.status_changed`,
`incident.severity_changed`, `incident.commander_assigned`).

**Errors**

| Status | Code                  | Meaning                                              |
| ------ | --------------------- | ----------------------------------------------------- |
| 400    | (validation)          | malformed body                                       |
| 404    | `INCIDENT_NOT_FOUND`  | same meaning as `GET`                                |
| 404    | `COMMANDER_NOT_FOUND` | `commanderId` was given but isn't a member of this org |

---

## GET /organizations/:organizationId/incidents/:incidentId/events

**Role required:** none beyond membership — any role can view.

**Query:** `?page=1&limit=10`, same as the incidents list.

**Success — `200`**

```json
{
  "items": [
    {
      "id": "...",
      "incidentId": "...",
      "actorType": "USER",
      "actorId": "...",
      "type": "incident.created",
      "message": "Incident reported: ...",
      "metadata": null,
      "createdAt": "..."
    }
  ],
  "page": 1,
  "limit": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

Ordered oldest-first (chronological timeline order).

**Errors**

| Status | Code                 | Meaning                           |
| ------ | -------------------- | ---------------------------------- |
| 400    | `INVALID_REQUEST`    | malformed pagination parameters   |
| 404    | `INCIDENT_NOT_FOUND` | same meaning as `GET` on the incident |

---

## POST /organizations/:organizationId/incidents/:incidentId/events

**Role required:** `ENGINEER`

Use this only for narrative notes that aren't a field change — field
changes are logged automatically by `PATCH`.

**Request body** (`CreateIncidentEventRequestSchema`):

```json
{
  "type": "note",
  "message": "Paged the payments on-call.",
  "metadata": { "runbookId": "rb-42" }
}
```

`type` — 1–100 chars, free text. `message` — 1–2000 chars. `metadata` is
optional, arbitrary JSON.

**Success — `201`**: the created event, same shape as an item in the
events list above.

**Errors**

| Status | Code                 | Meaning                |
| ------ | -------------------- | ------------------------ |
| 400    | (validation)         | malformed body          |
| 404    | `INCIDENT_NOT_FOUND` | same meaning as `GET`   |
