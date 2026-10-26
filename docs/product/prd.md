# Product Requirements Document

**Product:** Causolve
**Category:** B2B Incident Investigation and Response  
**Primary Users:** Software Engineers, SRE/DevOps Engineers, Incident Commanders, Engineering Managers

---

## 1. Product Summary

Causolve is an evidence-aware incident investigation and response platform for engineering teams.

It is designed for complex incidents where signals conflict, evidence quality varies, tools may fail, and premature confidence can lead to unsafe remediation.

Causolve gathers operational evidence through controlled tools, maintains competing hypotheses, evaluates supporting and contradictory evidence asymmetrically, exposes investigation integrity, recommends remediation, applies RBAC and human approval, verifies recovery, and preserves the full incident record for postmortem learning.

### Product Principle

> **AI recommends. Humans authorize. Causolve enforces.**

---

## 2. Problem

Incident responders often have enough data but lack a reliable way to reason across it under pressure.

Common failure patterns include:

- correlated signals being counted as independent evidence;
- weak supporting evidence outweighing one decisive contradiction;
- teams converging too quickly on one root-cause narrative;
- stale or unavailable telemetry being treated as trustworthy;
- AI investigations failing when a required tool or model becomes unavailable;
- remediation decisions being made without incorporating investigation uncertainty.

Causolve treats incident response as an **evidence reasoning problem**, not only a coordination problem.

---

## 3. Product Goals

Causolve must:

1. Centralize the incident lifecycle.
2. Gather evidence from controlled diagnostic tools.
3. Maintain multiple competing hypotheses.
4. Distinguish support, contradiction, and invalidating evidence.
5. Weight evidence by reliability, independence, freshness, specificity, and directness.
6. Expose evidence coverage and investigation integrity.
7. Continue operating safely when tools, telemetry, AI, or automation degrade.
8. Adjust remediation policy based on operational risk and investigation certainty.
9. Enforce tenant isolation and RBAC.
10. Require human authorization for consequential remediation.
11. Verify recovery before resolution.
12. Generate a factual postmortem from the recorded incident history.

---

## 4. Core Users

### Admin
Manages organization membership, teams, roles, services, and policy configuration.

### Incident Commander
Owns incident response, reviews recommendations, authorizes remediation, and resolves incidents.

### Engineer / Responder
Investigates incidents, reviews evidence, adds observations, and participates in remediation.

### Observer
Has read-only visibility into incidents, timelines, evidence, and postmortems.

### Engineering Manager
Reviews incident history, recurring causes, response metrics, and postmortems.

---

## 5. Core Product Flow

```text
Incident Created
      ↓
Acknowledge
      ↓
Gather Initial Context
      ↓
Generate Candidate Hypotheses
      ↓
Collect Evidence
      ↓
Evaluate Support + Contradictions
      ↓
Select Most Discriminating Next Tool
      ↓
Re-score Hypotheses
      ↓
Assess Investigation Integrity
      ↓
Recommendation
      ↓
Risk + Certainty Policy
      ↓
RBAC + Human Approval
      ↓
Remediation
      ↓
Verification
      ↓
Monitoring
      ↓
Resolved
      ↓
Postmortem
```

A Progressive Degradation Manager runs throughout the investigation.

---

## 6. Incident Lifecycle

```text
DETECTED
   ↓
ACKNOWLEDGED
   ↓
INVESTIGATING
   ↓
MITIGATING
   ↓
MONITORING
   ↓
RESOLVED
```

Workflow conditions may additionally include:

- `INVESTIGATION_DEGRADED`
- `INVESTIGATION_FAILED`
- `REMEDIATION_FAILED`
- `VERIFICATION_FAILED`

State transitions are enforced by the backend.

---

## 7. Evidence Model

Every investigation observation becomes structured evidence.

### Evidence Relation

```text
SUPPORTS
CONTRADICTS
NEUTRAL
INVALIDATES
```

### Evidence Attributes

Each evidence item records:

- source;
- observation;
- hypothesis relationship;
- reliability;
- specificity;
- directness;
- freshness;
- independence group;
- temporal relevance;
- contradiction severity;
- provenance.

The system must not treat evidence count as evidence strength.

---

## 8. Asymmetric Evidence Contradiction Engine

The Contradiction Engine evaluates evidence against every active hypothesis.

A single high-quality contradiction may outweigh several weak supporting observations.

### Contradiction Levels

```text
WEAK
MODERATE
STRONG
INVALIDATING
```

### Hypothesis View

Each hypothesis exposes:

- support strength;
- contradiction pressure;
- evidence quality;
- independent evidence groups;
- unresolved contradictions;
- current status.

### Hypothesis Status

```text
CANDIDATE
PLAUSIBLE
LEADING
WEAKENED
INVALIDATED
CONFIRMED
```

Causolve actively searches for evidence that could disprove the leading hypothesis.

---

## 9. Competing Hypotheses

The investigation maintains a hypothesis set rather than one permanent root-cause guess.

Example:

```text
H1 Deployment regression
H2 External payment provider degradation
H3 Database connection exhaustion
```

Tool selection should prioritize evidence that best distinguishes competing hypotheses.

The investigation ends when sufficient evidence exists for a safe recommendation or when degradation policy requires human escalation.

---

## 10. Investigation Integrity

Causolve continuously evaluates how trustworthy the investigation is.

### Integrity Inputs

- evidence coverage;
- unavailable sources;
- stale sources;
- evidence independence;
- unresolved contradictions;
- hypothesis separation;
- AI/tool failures.

### Integrity States

```text
HIGH
MODERATE
DEGRADED
LOW
```

Example:

```text
Evidence coverage: 74%
Independent sources: 4
Unavailable sources: 1
Unresolved contradictions: 2
Integrity: DEGRADED
```

Integrity affects remediation policy.

---

## 11. Progressive Degradation

Causolve must continue safely when capabilities fail.

### Capability States

```text
AVAILABLE
PARTIAL
STALE
UNAVAILABLE
FAILED
```

### Degradation Levels

**Level 0: Full**  
All required investigation capabilities are available.

**Level 1: Evidence Degraded**  
One evidence source is unavailable or stale. Investigation continues with reduced certainty.

**Level 2: Multi-source Degraded**  
Multiple important sources are unavailable. Confirmation thresholds increase.

**Level 3: AI Degraded**  
AI service is unavailable. Causolve falls back to deterministic incident workflow, manual evidence capture, runbooks, RBAC, remediation, and verification.

**Level 4: Automation Degraded**  
Investigation works but automated remediation is unavailable. Causolve provides the approved manual procedure and continues verification.

**Level 5: Manual Command**  
Causolve preserves incident command, timeline, evidence, roles, decisions, approval records, and verification checklists.

---

## 12. Remediation Policy

Remediation authorization considers:

```text
Technical Risk
+ Blast Radius
+ Investigation Integrity
+ Evidence Coverage
+ Contradiction Pressure
= Approval Requirement
```

Example:

```text
Medium-risk rollback
+ High integrity
→ 1 Incident Commander approval

Medium-risk rollback
+ Degraded integrity
→ 2 authorized approvals
```

The AI cannot approve its own recommendation.

---

## 13. RBAC

Initial roles:

| Capability | Observer | Engineer | Incident Commander | Admin |
|---|---:|---:|---:|---:|
| View incidents | Yes | Yes | Yes | Yes |
| Add evidence/notes | No | Yes | Yes | Yes |
| Start investigation | No | Yes | Yes | Yes |
| Approve remediation | No | Limited | Yes | Yes |
| Resolve incident | No | No | Yes | Yes |
| Manage organization | No | No | No | Yes |

Authorization is enforced by the backend.

---

## 14. Simulated MVP Scenarios

### Scenario A: Contradictory Payment Incident

Ground truth: external payment provider degradation.

Initial evidence makes a recent deployment appear suspicious.

A high-quality contradiction later shows the previous deployment version is failing identically.

Expected behavior:

1. deployment hypothesis leads initially;
2. contradictory evidence weakens it;
3. provider-degradation hypothesis becomes leading;
4. recommendation changes accordingly.

### Scenario B: Progressive Degradation

During investigation:

```text
searchLogs → FAILED
metrics → PARTIAL
```

Expected behavior:

1. investigation continues;
2. evidence coverage falls;
3. integrity becomes degraded;
4. high-confidence confirmation becomes unavailable;
5. approval policy becomes more conservative.

---

## 15. MVP Features

### Incident Management
- incident creation;
- severity;
- lifecycle;
- responders;
- timeline;
- affected service.

### Investigation
- candidate hypotheses;
- controlled tools;
- evidence provenance;
- contradiction analysis;
- investigation integrity;
- progressive degradation.

### Decision and Response
- recommendation;
- remediation risk;
- RBAC;
- approval;
- simulated remediation;
- recovery verification.

### Organizational
- organizations;
- teams;
- services;
- roles;
- audit logs.

### Post-Incident
- postmortem draft;
- hypothesis history;
- contradictions discovered;
- degradation events;
- final resolution;
- preventative actions.

---

## 16. Success Criteria

The MVP is successful when:

- the core incident workflow completes reliably;
- contradictory evidence can change the leading hypothesis;
- correlated evidence is not double-counted as independent evidence;
- failed evidence sources reduce integrity without collapsing the workflow;
- remediation approval becomes stricter when certainty degrades;
- unauthorized remediation is always blocked;
- incidents are resolved only after successful verification;
- the entire flagship scenario passes deterministic E2E testing.

---

## 17. Flagship E2E Flow

```text
Create Organization
↓
Create Checkout Service
↓
Trigger Payment Incident
↓
Initial Hypothesis: Deployment Regression
↓
Gather Supporting Evidence
↓
Strong Contradiction Appears
↓
Deployment Hypothesis Weakens
↓
Provider Degradation Becomes Leading
↓
Log Tool Fails
↓
Progressive Degradation Activates
↓
Integrity Falls
↓
Approval Requirement Increases
↓
Authorized Human Approves Mitigation
↓
Simulated Mitigation Executes
↓
Verification Succeeds
↓
Incident Resolves
↓
Postmortem Records Hypothesis Revision,
Contradictions, Degradation, and Final Decision
```

---

## 18. Product Positioning

> **Causolve is an evidence-aware incident investigation and response platform built for complex failures where signals conflict, tools degrade, and premature confidence is dangerous.**
