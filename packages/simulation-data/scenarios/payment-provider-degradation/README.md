# Causolve deterministic simulation data

Scenario: `payment-provider-degradation`

This package is a reusable operational scenario for testing
investigations. The CSV files define the simulated environment. A real
organization owns the runtime simulation instance and all actions
performed during that run.

## Structure

``` text
topology/     Services and dependencies
operations/   Incident source data, deployments, changes, runtime observations
telemetry/    Alerts, metrics, logs, traces, dependency observations
knowledge/    Historical incidents and runbooks
simulation/   Scenario clock, environmental phases, capability events
oracle/       Expected observations and outcomes used only for evaluation
```

## Static scenario and runtime state

The scenario template is shared by every organization. Starting a
simulation creates an isolated runtime instance for the authenticated
organization.

The template supplies the same deterministic operational world to each
instance. Runtime state records what actually happens in that
organization's run, including user actions, investigation state,
approvals, remediation, verification, and final incident state.

Static IDs identify records inside the template. Tenant ownership
belongs to the runtime instance and must not be inferred from template
IDs.

## Scenario flow

The scenario starts at `2026-09-19T13:30:00Z`.

1.  Baseline operational data is available.
2.  PayFlow authorization performance begins degrading at `13:58`.
3.  Payment failures cross the incident threshold and `INC-1042` is
    detected.
4.  Causolve investigates through bounded operational tools.
5.  The recent payment-api deployment provides a plausible competing
    explanation.
6.  Provider, database, trace, deployment, runtime, and other
    observations provide evidence for or against competing hypotheses.
7.  `LOG_SEARCH` fails at `14:23`. Stored logs remain in the database,
    but log search becomes unavailable to the investigation.
8.  Causolve must reduce evidence coverage/integrity as appropriate and
    continue using the capabilities that remain available.
9.  Causolve may recommend remediation from the evidence it derived.
10. A real authorized user decides whether to approve consequential
    remediation.
11. Successful simulated remediation may unlock the recovery
    observations associated with that outcome.
12. Causolve verifies recovery from operational data before runtime
    incident resolution.

The static template does not pre-authorize or pre-complete user actions.

## Time and visibility

The database may contain the complete scenario history, but operational
tools must behave as if the simulation is unfolding in time.

Every time-aware query must use the active simulation time as `asOf`.

``` text
visible record time <= asOf
effective end = min(requested end, asOf)
```

Future state must not leak through fields such as alert resolution,
completed deployments, health changes, or other lifecycle data.

Recovery observations that depend on successful remediation must also be
gated by the runtime remediation outcome. Reaching their timestamp alone
is not enough.

## Capabilities

Capability state comes from the latest `capability_events.csv` row whose
`effectiveAt <= asOf`.

Capability state controls access independently of stored data. For
example, after `LOG_SEARCH` becomes `FAILED`, the log tool must fail or
return the defined degraded result even though log rows still exist.

Scenario phases are simulator control data. They are not evidence and
must not be shown to the AI or used to reveal the correct explanation.

## Investigation boundary

Operational tools expose bounded views of topology, metrics, logs,
traces, deployments, changes, runtime state, alerts, incident history,
and runbooks.

Causolve derives evidence, hypotheses, evidence relationships,
contradiction pressure, evidence coverage, integrity, recommendations,
approvals, remediation, and verification during the run. These are not
seeded from the scenario.

## Oracle

`oracle/` contains hidden evaluation truth. It is used by tests to
determine whether the investigation reached the expected observations
and outcome.

Oracle data must never be available to operational APIs, LangGraph, the
LLM, or any AI-facing tool.

## Core invariant

The AI may investigate only what the simulated organization could know
at the current runtime state. The correct answer must emerge from
operational evidence, not from scenario metadata, future data, or oracle
truth.
