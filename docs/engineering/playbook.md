# Engineering Playbook

**Purpose:** Concise implementation guide for building the Causolve MVP
without coupling progress to one team member.

------------------------------------------------------------------------

## 1. Architecture

Causolve has three independently developable domains connected through
stable contracts.

``` text
React PWA
Frontend + Product UI
      │
      │ REST + SSE
      ▼
Node.js + Express + TypeScript
Domain API + Auth + RBAC + Persistence
      │
      ├──────────────► PostgreSQL + Prisma ORM
      │
      │ HTTP
      ▼
Python + FastAPI + LangGraph
Investigation + Evidence Reasoning
```

### Ownership

**Frontend + AI** - React product UI and PWA - client state and
server-state integration - simulated API layer and fixtures - FastAPI
and LangGraph - hypothesis reasoning - evidence normalization -
asymmetric contradiction engine - investigation integrity - progressive
degradation - recommendation generation

**Backend** - Express API - PostgreSQL + Prisma - authentication -
organizations and tenant isolation - RBAC - incident lifecycle
persistence - approvals and remediation - audit history - SSE
publishing - AI-service integration

The domains must remain independently testable. Frontend and AI
development must not require completed backend endpoints.

------------------------------------------------------------------------

## 2. Technology Stack

### Frontend

``` text
React
TypeScript
Vite
React Router
Tailwind CSS
shadcn/ui + Base UI
Zustand
TanStack Query
Axios
Zod
React Hook Form
Recharts
Lucide React
vite-plugin-pwa
Vitest + React Testing Library
Playwright
MSW
```

### Backend

``` text
Node.js
Express
TypeScript
PostgreSQL
Prisma ORM
Zod
Authentication
Helmet + CORS
SSE
Vitest + Supertest
```

### AI Service

``` text
Python
FastAPI
LangGraph
Pydantic
Gemini through provider abstraction
Pytest
Ruff
```

------------------------------------------------------------------------

## 3. Repository Structure

``` text
resolve-os/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── mocks/
│   │       ├── services/
│   │       ├── routes/
│   │       ├── store/
│   │       └── types/
│   │
│   ├── backend/
│   │   ├── prisma/
│   │   └── src/
│   │       ├── middleware/
│   │       ├── modules/
│   │       ├── policies/
│   │       ├── infrastructure/
│   │       └── simulation/
│   │
│   └── ai/
│       └── src/
│           ├── api/
│           ├── graph/
│           ├── reasoning/
│           ├── schemas/
│           ├── tools/
│           └── prompts/
│
├── docs/
├── e2e/
└── packages/
    ├── contracts/
    ├── database/
    └── simulation-data/
```

`packages/contracts` defines the shared API shapes used by mocks,
frontend, backend, and AI integration.

------------------------------------------------------------------------

## 4. Contract-First Development

Contracts must be defined before implementation so each domain can progress
independently.

Core contracts:

``` text
Incident
Investigation
Hypothesis
Evidence
EvidenceHypothesisRelation
CapabilityState
Recommendation
Approval
Remediation
Postmortem
SSEEvent
```

Example:

``` ts
interface Hypothesis {
  id: string;
  statement: string;
  status:
    | "CANDIDATE"
    | "PLAUSIBLE"
    | "LEADING"
    | "WEAKENED"
    | "INVALIDATED"
    | "CONFIRMED";
  supportStrength: number;
  contradictionPressure: number;
  evidenceQuality: "LOW" | "MODERATE" | "HIGH";
  rank: number;
}
```

### Development Adapters

``` text
Frontend → MSW / deterministic fixtures
Frontend → Express API

Express → simulated AI response
Express → FastAPI

FastAPI → simulated diagnostic tools
FastAPI → future real integrations
```

Replacing an adapter must not require rewriting consuming features.

------------------------------------------------------------------------

## 5. Frontend State Rules

**Zustand:** global client-only state such as sidebar, dialogs, local
preferences, and temporary UI state.

**TanStack Query:** all server state including incidents,
investigations, hypotheses, evidence, approvals, services, and
postmortems.

**MSW:** development and test API simulation until real endpoints are
available.

**SSE:** updates TanStack Query caches instead of duplicating server
state in Zustand.

------------------------------------------------------------------------

## 6. Core Data Model

PostgreSQL is the source of truth. Prisma manages schema, relations,
migrations, and data access.

``` text
Organization
├── Users
├── Teams
├── Services
│   └── Incidents
│       ├── IncidentEvents
│       ├── Investigation
│       │   ├── Hypotheses
│       │   ├── Evidence
│       │   │   └── EvidenceHypothesisRelations
│       │   ├── ToolExecutions
│       │   ├── CapabilityStates
│       │   └── Recommendation
│       │       ├── Approvals
│       │       └── Remediation
│       └── Postmortem
└── AuditLogs
```

### Key Investigation Records

**Investigation**

``` text
id
incidentId
status
integrity
evidenceCoverage
degradationLevel
startedAt
completedAt
```

**Hypothesis**

``` text
id
investigationId
statement
status
supportStrength
contradictionPressure
evidenceQuality
rank
```

**Evidence**

``` text
id
investigationId
source
sourceType
observation
reliability
specificity
directness
freshness
temporalRelevance
independenceGroup
provenance
```

**EvidenceHypothesisRelation**

``` text
evidenceId
hypothesisId
relation
contradictionSeverity
weight
```

Relations:

``` text
SUPPORTS
CONTRADICTS
NEUTRAL
INVALIDATES
```

All organization-owned database access must be tenant-scoped.

------------------------------------------------------------------------

## 7. LangGraph Architecture

### Investigation State

``` text
incident context
hypotheses[]
evidence[]
tool history[]
capability states[]
evidence coverage
integrity
degradation level
leading hypothesis
recommendation
iteration
```

### Graph

``` text
START
  ↓
load_context
  ↓
assess_capabilities
  ↓
generate_hypotheses
  ↓
select_discriminating_tool
  ↓
execute_tool
  ↓
normalize_evidence
  ↓
relate_evidence
  ↓
score_support
  ↓
run_contradiction_engine
  ↓
rank_hypotheses
  ↓
assess_integrity
  ↓
enough_evidence?
  ├── NO ───────► select_discriminating_tool
  ├── DEGRADED ─► apply_degradation_policy
  └── YES ──────► generate_recommendation
                         ↓
                        END
```

Remediation authorization and execution remain backend responsibilities.

------------------------------------------------------------------------

## 8. Evidence and Contradiction Engine

Evidence is evaluated by:

``` text
reliability
specificity
directness
freshness
temporal relevance
independence
```

Evidence sharing the same underlying signal receives the same
`independenceGroup` so correlated observations are not double-counted.

Contradiction severity:

``` text
WEAK
MODERATE
STRONG
INVALIDATING
```

A high-quality contradiction may outweigh several weak supporting
observations.

Example:

``` text
H1: deployment regression

Weak support:
recent deployment
error spike after alert

Strong contradiction:
old deployment version fails identically

Result:
H1 → WEAKENED
```

Hypothesis ranking uses support strength, contradiction pressure,
evidence quality, independent source count, and evidence coverage.

The system records why every material ranking change occurred.

------------------------------------------------------------------------

## 9. Discriminating Tool Selection

The next tool should answer:

> Which observation would best distinguish the leading hypotheses?

Initial simulated tools:

``` text
getServiceHealth
getRecentDeployments
searchLogs
getMetrics
getPreviousIncidents
getRunbook
```

Each returns:

``` text
status
source
data
freshness
provenance
error
```

Capability status:

``` text
AVAILABLE
PARTIAL
STALE
UNAVAILABLE
FAILED
```

------------------------------------------------------------------------

## 10. Progressive Degradation

Causolve continues safely when capabilities fail.

``` text
Level 0  Full investigation

Level 1  One evidence source degraded
         Continue with reduced certainty

Level 2  Multiple important sources degraded
         Increase confirmation requirements

Level 3  AI unavailable
         Fall back to deterministic/manual investigation

Level 4  Automation unavailable
         Provide approved manual remediation procedure

Level 5  Manual command
         Preserve timeline, evidence, roles,
         decisions, approvals, and verification
```

Degradation affects evidence coverage, investigation integrity, and
remediation policy.

Every degradation transition becomes an incident timeline and audit
event.

------------------------------------------------------------------------

## 11. RBAC and Remediation

Authorization flow:

``` text
Authenticate
↓
Resolve organization
↓
Verify tenant ownership
↓
Check role and permission
↓
Check incident state
↓
Evaluate remediation policy
↓
Approve or reject execution
```

Remediation policy considers:

``` text
technical risk
+ blast radius
+ investigation integrity
+ evidence coverage
+ contradiction pressure
= approval requirement
```

The AI generates recommendations. It cannot authorize remediation.

------------------------------------------------------------------------

## 12. Real-Time Events

Core SSE events:

``` text
incident.updated

investigation.started
investigation.tool_started
investigation.tool_failed
investigation.evidence_added
investigation.hypothesis_updated
investigation.integrity_changed
investigation.degraded
investigation.recommendation_ready

approval.requested
approval.completed

remediation.started
remediation.completed
verification.completed

incident.resolved
```

------------------------------------------------------------------------

## 13. Flagship MVP Scenario

Build one deterministic incident completely before expanding scenarios.

``` text
Payment incident triggered
↓
Recent deployment discovered
↓
H1 Deployment Regression leads
↓
H2 Provider Degradation generated
↓
H3 Database Exhaustion generated
↓
Supporting evidence collected
↓
Old deployment version also fails
↓
Strong contradiction against H1
↓
H1 becomes WEAKENED
↓
Provider latency rises
↓
H2 becomes LEADING
↓
searchLogs fails
↓
Progressive degradation activates
↓
Evidence coverage falls
↓
Integrity becomes DEGRADED
↓
Recommendation generated
↓
Approval requirement increases
↓
Authorized human approves
↓
Simulated mitigation executes
↓
Verification succeeds
↓
Incident resolves
↓
Postmortem records reasoning history
```

This fixture drives AI tests, frontend mocks, integration tests, and
Playwright E2E.

------------------------------------------------------------------------

## 14. Parallel Execution Plan

### Frontend + AI Track

``` text
1. Repository and shared contracts
2. Frontend foundation
3. MSW + flagship fixture
4. Landing page implementation
5. Application shell
6. Incident Command Center
7. Investigation workspace
8. FastAPI + LangGraph foundation
9. Simulated diagnostic tools
10. Hypothesis generation
11. Evidence normalization
12. Contradiction engine
13. Hypothesis re-ranking
14. Investigation integrity
15. Progressive degradation
16. Recommendation generation
17. Frontend integration with mocks
18. Unit + AI tests
19. Mocked flagship E2E
```

### Backend Track

``` text
1. Express + PostgreSQL + Prisma
2. Authentication
3. Organizations + tenant isolation
4. Teams + RBAC
5. Services
6. Incident lifecycle + timeline
7. Investigation persistence
8. Evidence + hypothesis persistence
9. FastAPI integration
10. SSE
11. Approval + remediation
12. Verification + postmortem
13. Audit logging
```

### Integration

Replace adapters incrementally:

``` text
MSW → Express
Fixtures → PostgreSQL
Simulated AI response → FastAPI
Mock SSE → Real SSE
Mock auth → Real auth/RBAC
```

------------------------------------------------------------------------

## 15. Testing

**Unit** - incident transitions - RBAC - evidence weighting -
independence grouping - contradiction/invalidation rules - integrity
calculation - degradation policy - approval policy

**Integration** - Express + PostgreSQL + Prisma - Node/FastAPI
contracts - persistence - SSE - remediation and verification

**AI** - hypothesis generation - evidence mapping - contradiction
handling - discriminating tool selection - degradation paths

**E2E** The flagship payment incident must pass from incident creation
through hypothesis reversal, degradation, approval, remediation,
verification, resolution, and postmortem.

------------------------------------------------------------------------

## 16. MVP Definition of Done

The MVP is ready when:

-   tenant isolation and RBAC are enforced;
-   incident lifecycle is controlled;
-   competing hypotheses are maintained;
-   decisive contradictions can weaken or invalidate hypotheses;
-   correlated evidence is not double-counted;
-   investigation integrity and evidence coverage are visible;
-   failed tools trigger progressive degradation;
-   degraded certainty changes approval requirements;
-   AI cannot authorize remediation;
-   recovery is verified before resolution;
-   the flagship E2E scenario passes reliably.
