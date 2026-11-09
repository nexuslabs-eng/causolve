# Investigations API

Base path: `/organizations/:organizationId/incidents/:incidentId/investigation`.
Request/response shapes are defined in
`packages/contracts/src/investigations/investigation.schema.ts`.

Every route here requires an authenticated session (`401 UNAUTHENTICATED`
otherwise), **and** that the user has a `Membership` in the organization
named by `:organizationId` (`404 ORGANIZATION_NOT_FOUND` otherwise — same
tenant-isolation reasoning as the Incidents API). Starting an investigation
additionally requires the `ENGINEER` role (`403 FORBIDDEN` otherwise);
viewing is open to any member regardless of role.

An incident has at most one investigation (`Incident.incidentId` is unique
on `Investigation`). Starting one appends an `investigation.started` entry
to the incident's own timeline (see the Incidents API docs), the same way
status/severity/commander changes do.

This endpoint does not yet trigger an actual AI run — it only creates the
persistence record in `PENDING` status. Wiring it to the AI service's
`/investigations/run` endpoint is a separate, later step; `status`,
`integrity`, `evidenceCoverage`, and `leadingHypothesisId` will start
reflecting real progress once that's in place.

---

## POST /organizations/:organizationId/incidents/:incidentId/investigation

**Role required:** `ENGINEER`

No request body.

**Success — `201`**

```json
{
  "id": "...",
  "incidentId": "...",
  "status": "PENDING",
  "integrity": "HIGH",
  "evidenceCoverage": 0,
  "leadingHypothesisId": null,
  "startedAt": "...",
  "completedAt": null
}
```

**Errors**

| Status | Code                        | Meaning                                                    |
| ------ | --------------------------- | ------------------------------------------------------------- |
| 404    | `INCIDENT_NOT_FOUND`        | no incident with this ID exists in this organization          |
| 409    | `INVESTIGATION_ALREADY_EXISTS` | an investigation was already started for this incident     |

---

## GET /organizations/:organizationId/incidents/:incidentId/investigation

**Role required:** none beyond membership — any role can view.

**Success — `200`**: same shape as `POST`'s response, reflecting current state.

**Errors**

| Status | Code                     | Meaning                                                |
| ------ | ------------------------ | --------------------------------------------------------- |
| 404    | `INCIDENT_NOT_FOUND`     | no incident with this ID exists in this organization       |
| 404    | `INVESTIGATION_NOT_FOUND` | the incident exists but no investigation has been started yet |
