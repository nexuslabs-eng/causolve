# Workspace Settings API

Workspace routes are organization-scoped. Request and response shapes are
defined in `packages/contracts/src/settings/`. All routes require an
authenticated member of `:organizationId` (`401 UNAUTHENTICATED` or
`404 ORGANIZATION_NOT_FOUND` otherwise). Mutations require the `ADMIN` role
(`403 FORBIDDEN`).

---

## PATCH /workspace/settings/general

Updates the active workspace name, slug, and team size. These values are
already returned by the auth session, so no separate GET endpoint is needed.

**Request body** (`UpdateWorkspaceSettingsRequestSchema`):

```json
{
  "name": "NexusLabs Engineering",
  "slug": "nexuslabs-engineering",
  "teamSize": "SIX_TO_TWENTY"
}
```

**Success - `200`** (`WorkspaceSettingsSchema`):

```json
{
  "organizationId": "...",
  "name": "NexusLabs Engineering",
  "slug": "nexuslabs-engineering",
  "teamSize": "SIX_TO_TWENTY"
}
```

The updated values must also be returned by `GET /auth/session`. Return
`409 SLUG_TAKEN` when the slug is already used.

---

## Investigation configuration

### GET /organizations/:organizationId/investigation-settings

Returns the current investigation settings. Any organization member may read.

### PATCH /organizations/:organizationId/investigation-settings

Updates the complete `InvestigationSettingsSchema`:

```json
{
  "autoStartInvestigations": true,
  "evidenceCollectionTimeout": {
    "value": 15,
    "unit": "MINUTES"
  },
  "maxEvidenceItems": 100,
  "requireEvidenceAttribution": true
}
```

`unit` is `SECONDS` or `MINUTES`. The backend may normalize the timeout for
execution, but must accept and return both `value` and `unit`.

---

## AI and evidence policies

### GET /organizations/:organizationId/ai-evidence-settings

Returns the current AI and evidence policies. Any organization member may
read.

### PATCH /organizations/:organizationId/ai-evidence-settings

Updates the complete `AiEvidenceSettingsSchema`:

```json
{
  "aiAssistanceEnabled": true,
  "humanApprovalRequired": true,
  "externalEvidenceAllowed": false,
  "evidenceRetentionDays": 365
}
```

`evidenceRetentionDays` must be between 30 and 3650.

---

## Approvals and remediation

### GET /organizations/:organizationId/approval-settings

Returns the current approval and remediation policies. Any organization
member may read.

### PATCH /organizations/:organizationId/approval-settings

Updates the complete `ApprovalSettingsSchema`:

```json
{
  "requireApprovalBeforeRemediation": true,
  "minimumRequiredApprovals": 2,
  "automaticRemediationEnabled": false,
  "approvalTimeoutHours": 24
}
```

`minimumRequiredApprovals` is 1-5. `approvalTimeoutHours` is 1-720.

---

## Audit and activity

This resource configures audit behavior. It is not the operational Activity
page and does not return an event list.

### GET /organizations/:organizationId/audit-settings

Returns the current audit configuration. Any organization member may read.

### PATCH /organizations/:organizationId/audit-settings

Updates the complete `AuditSettingsSchema`:

```json
{
  "retentionPeriodDays": 365,
  "exportPermission": "ADMINS_ONLY",
  "eventCategories": ["MEMBERSHIP", "SETTINGS", "INCIDENTS"],
  "complianceArchivalEnabled": true
}
```

`exportPermission` is `ADMINS_ONLY`, `ADMINS_AND_AUDITORS`, or `ALL_MEMBERS`.
`eventCategories` contains one or more supported audit categories.

---

## Related resources

- Members and invitations: `docs/api/invitations.md`.
- Teams and team membership: `docs/api/teams.md`.
- Integrations currently use simulated frontend data and have no backend
  endpoint requirement.

Common errors for organization settings: `400` validation failure,
`401 UNAUTHENTICATED`, `403 FORBIDDEN`, and `404 ORGANIZATION_NOT_FOUND`.
