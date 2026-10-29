# AI Investigations API

Base URL: the internal Causolve AI service. The endpoint is called by the
Express backend and is not intended for direct browser or frontend access.
Request and response shapes are defined by the shared schemas in
`packages/contracts/src/internal-ai/` and mirrored by Pydantic in
`apps/ai/app/contracts/`.

---

## POST /investigations/run

Starts an AI investigation using structured incident, service, and capability
context. The AI service controls the provider prompts; callers do not submit an
arbitrary prompt.

### Authentication

Send the shared internal service secret as a bearer token:

```http
Authorization: Bearer <AI_INTERNAL_API_KEY>
Content-Type: application/json
```

The key must match `AI_INTERNAL_API_KEY` configured for the AI service. Keep
the real value in local or deployment secrets, never in committed files.

### Request body

```json
{
  "investigationId": "11111111-1111-4111-8111-111111111111",
  "incident": {
    "id": "22222222-2222-4222-8222-222222222222",
    "title": "Payment requests are failing",
    "description": "Customers are experiencing elevated payment failures and response latency.",
    "severity": "HIGH"
  },
  "service": {
    "id": "33333333-3333-4333-8333-333333333333",
    "name": "payment-service",
    "environment": "production",
    "currentVersion": "2.4.1"
  },
  "capabilityStates": [
    {
      "capability": "METRICS",
      "status": "AVAILABLE",
      "freshness": 99.5,
      "reason": null,
      "updatedAt": "2026-10-29T17:47:00Z"
    }
  ]
}
```

- `investigationId` identifies the investigation created and owned by Express.
- `incident` describes the operational problem being investigated.
- `service` identifies the affected service and deployed version.
- `capabilityStates` describes which diagnostic capabilities are available,
  degraded, or unavailable and how current their data is.

### Current success response - `200`

The foundation graph currently verifies LangGraph and Gemini execution without
creating investigation intelligence. A successful verification therefore
returns `DEGRADED` with empty proposal collections:

```json
{
  "investigationId": "11111111-1111-4111-8111-111111111111",
  "status": "DEGRADED",
  "hypothesisProposals": [],
  "evidenceInterpretations": [],
  "recommendationProposal": null,
  "error": "Graph and provider verification succeeded. Investigation intelligence is not implemented."
}
```

### Execution failure response - `200`

Provider configuration, provider execution, timeout, and unexpected graph
failures are returned as contract-compatible `FAILED` results. The `error`
field contains a controlled description and does not expose credentials,
prompts, provider responses, or internal exception details.

```json
{
  "investigationId": "11111111-1111-4111-8111-111111111111",
  "status": "FAILED",
  "hypothesisProposals": [],
  "evidenceInterpretations": [],
  "recommendationProposal": null,
  "error": "AI provider execution failed (timeout)."
}
```

### HTTP errors

| Status | Meaning |
| ------ | ------- |
| 401 | The bearer token is missing or does not match the configured internal key. |
| 422 | The request body does not satisfy the Pydantic request contract. |
| 503 | Internal service authentication is not configured on the AI service. |

Provider and graph failures use a `200` response with `status: "FAILED"` so
the backend can validate one stable investigation-result contract.

### Future completed response

When investigation intelligence is implemented, a successful result may use
`status: "COMPLETED"` and populate `hypothesisProposals`,
`evidenceInterpretations`, and `recommendationProposal`. Express remains
responsible for tenant isolation, RBAC, persistence, incident lifecycle
transitions, approvals, and remediation authorization.
