import type { Incident } from "contracts/incidents/incident.schema";
import type { Service } from "contracts/services/service.schema";
import type { CapabilityState } from "contracts/investigations/capability-state.schema";
import type { Evidence } from "contracts/investigations/evidence.schema";
import type { EvidenceHypothesisRelation } from "contracts/investigations/evidence-relation.schema";
import type { Hypothesis } from "contracts/investigations/hypothesis.schema";
import type { InvestigationIntegrity } from "contracts/investigations/investigation-integrity.schema";
import type { Investigation } from "contracts/investigations/investigation.schema";
import type { HypothesisRankingChange } from "contracts/investigations/ranking-change.schema";
import type { ApprovalPolicy } from "contracts/recommendations/approval-policy.schema";
import type { Recommendation } from "contracts/recommendations/recommendation.schema";
import type { Verification } from "contracts/recommendations/verification.schema";

type EvidenceQuality = "LOW" | "MODERATE" | "HIGH";

const IDS = {
  organization: "00000000-0000-4000-8000-000000000001",
  team: "00000000-0000-4000-8000-000000000002",
  commander: "00000000-0000-4000-8000-000000000003",
  service: "00000000-0000-4000-8000-000000000004",
  incident: "00000000-0000-4000-8000-000000000005",
  investigation: "00000000-0000-4000-8000-000000000006",
  h1: "00000000-0000-4000-8000-000000000007",
  h2: "00000000-0000-4000-8000-000000000008",
  h3: "00000000-0000-4000-8000-000000000009",
  ev18: "00000000-0000-4000-8000-000000000018",
  ev24: "00000000-0000-4000-8000-000000000024",
  ev31: "00000000-0000-4000-8000-000000000031",
  ev33: "00000000-0000-4000-8000-000000000033",
  relation18: "00000000-0000-4000-8000-000000000118",
  relation24: "00000000-0000-4000-8000-000000000124",
  relation31: "00000000-0000-4000-8000-000000000131",
  relation33: "00000000-0000-4000-8000-000000000133",
  recommendation: "00000000-0000-4000-8000-000000000201",
  remediation: "00000000-0000-4000-8000-000000000202",
  verification: "00000000-0000-4000-8000-000000000203",
} as const;

const STARTED_AT = "2026-08-21T13:56:00.000Z";
const SCENARIO_NOW = "2026-08-21T14:07:00.000Z";

export const SERVICE = {
  id: IDS.service,
  organizationId: IDS.organization,
  teamId: IDS.team,
  name: "checkout-api",
  environment: "production",
  healthStatus: "DEGRADED",
  currentVersion: "2.8.4",
  createdAt: "2026-01-12T09:00:00.000Z",
  updatedAt: SCENARIO_NOW,
} satisfies Service;

export const INCIDENT = {
  id: IDS.incident,
  reference: "INC-1042",
  organizationId: IDS.organization,
  serviceId: IDS.service,
  title: "Checkout payment latency spike",
  description: "Checkout requests are timing out while payment provider latency is elevated.",
  severity: "HIGH",
  status: "INVESTIGATING",
  commanderId: IDS.commander,
  startedAt: STARTED_AT,
  acknowledgedAt: "2026-08-21T13:58:00.000Z",
  resolvedAt: null,
  createdAt: STARTED_AT,
  updatedAt: SCENARIO_NOW,
} satisfies Incident;

export const INVESTIGATION = {
  id: IDS.investigation,
  incidentId: IDS.incident,
  status: "DEGRADED",
  integrity: "DEGRADED",
  evidenceCoverage: 72,
  leadingHypothesisId: IDS.h2,
  startedAt: "2026-08-21T13:59:00.000Z",
  completedAt: null,
} satisfies Investigation;

export const HYPOTHESES = [
  {
    id: IDS.h1,
    reference: "H1",
    investigationId: IDS.investigation,
    statement: "Recent checkout deployment introduced a regression",
    status: "WEAKENED",
    supportStrength: 42,
    contradictionPressure: 86,
    independentEvidenceGroups: 2,
    unresolvedContradictions: 1,
    rank: 2,
    createdAt: "2026-08-21T14:00:00.000Z",
    updatedAt: "2026-08-21T14:04:00.000Z",
  },
  {
    id: IDS.h2,
    reference: "H2",
    investigationId: IDS.investigation,
    statement: "External payment provider degradation",
    status: "LEADING",
    supportStrength: 91,
    contradictionPressure: 8,
    independentEvidenceGroups: 2,
    unresolvedContradictions: 0,
    rank: 1,
    createdAt: "2026-08-21T14:00:00.000Z",
    updatedAt: "2026-08-21T14:06:00.000Z",
  },
  {
    id: IDS.h3,
    reference: "H3",
    investigationId: IDS.investigation,
    statement: "Database connection exhaustion",
    status: "WEAKENED",
    supportStrength: 18,
    contradictionPressure: 78,
    independentEvidenceGroups: 1,
    unresolvedContradictions: 1,
    rank: 3,
    createdAt: "2026-08-21T14:00:00.000Z",
    updatedAt: "2026-08-21T14:06:30.000Z",
  },
] satisfies Hypothesis[];

export const EVIDENCE = [
  {
    id: IDS.ev18,
    reference: "EV-18",
    investigationId: IDS.investigation,
    source: "deployment-service",
    sourceType: "DEPLOYMENT",
    observation: "checkout v2.8.4 deployed 7m before impact",
    reliability: 72,
    specificity: 76,
    directness: 48,
    freshness: 96,
    temporalRelevance: 92,
    independenceGroup: "checkout-deployment-v2.8.4",
    provenance: {
      capability: "DEPLOYMENTS",
      reference: "commit 4b19ac2",
      capturedAt: "2026-08-21T14:01:00.000Z",
    },
    createdAt: "2026-08-21T14:01:00.000Z",
  },
  {
    id: IDS.ev24,
    reference: "EV-24",
    investigationId: IDS.investigation,
    source: "deployment-service",
    sourceType: "DEPLOYMENT",
    observation: "Previous deployment version fails identically",
    reliability: 96,
    specificity: 94,
    directness: 98,
    freshness: 94,
    temporalRelevance: 96,
    independenceGroup: "controlled-version-comparison",
    provenance: {
      capability: "DEPLOYMENTS",
      reference: "controlled rollback test",
      capturedAt: "2026-08-21T14:04:00.000Z",
    },
    createdAt: "2026-08-21T14:04:00.000Z",
  },
  {
    id: IDS.ev31,
    reference: "EV-31",
    investigationId: IDS.investigation,
    source: "provider-gateway",
    sourceType: "METRIC",
    observation: "Provider p95 latency rose from 420ms to 2.8s",
    reliability: 94,
    specificity: 92,
    directness: 95,
    freshness: 98,
    temporalRelevance: 98,
    independenceGroup: "provider-latency",
    provenance: {
      capability: "METRICS",
      reference: "all checkout regions",
      capturedAt: "2026-08-21T14:06:00.000Z",
    },
    createdAt: "2026-08-21T14:06:00.000Z",
  },
  {
    id: IDS.ev33,
    reference: "EV-33",
    investigationId: IDS.investigation,
    source: "service-health",
    sourceType: "RUNTIME_STATE",
    observation: "Database pool health remains normal",
    reliability: 93,
    specificity: 90,
    directness: 91,
    freshness: 96,
    temporalRelevance: 94,
    independenceGroup: "database-pool-health",
    provenance: {
      capability: "RUNTIME_STATE",
      reference: "checkout database pool",
      capturedAt: "2026-08-21T14:06:30.000Z",
    },
    createdAt: "2026-08-21T14:06:30.000Z",
  },
] satisfies Evidence[];

export const EVIDENCE_RELATIONS = [
  {
    id: IDS.relation18,
    evidenceId: IDS.ev18,
    hypothesisId: IDS.h1,
    relation: "SUPPORTS",
    weight: 58,
    reasoning: "The deployment timing correlates with impact but does not establish causation.",
  },
  {
    id: IDS.relation24,
    evidenceId: IDS.ev24,
    hypothesisId: IDS.h1,
    relation: "CONTRADICTS",
    contradictionSeverity: "STRONG",
    weight: 94,
    reasoning: "The same failure on the prior version strongly contradicts a new deployment regression.",
  },
  {
    id: IDS.relation31,
    evidenceId: IDS.ev31,
    hypothesisId: IDS.h2,
    relation: "SUPPORTS",
    weight: 92,
    reasoning: "Provider latency increased across all checkout regions during the incident window.",
  },
  {
    id: IDS.relation33,
    evidenceId: IDS.ev33,
    hypothesisId: IDS.h3,
    relation: "CONTRADICTS",
    contradictionSeverity: "STRONG",
    weight: 88,
    reasoning: "Normal pool utilization and query latency contradict connection exhaustion.",
  },
] satisfies EvidenceHypothesisRelation[];

export const RANKING_CHANGES = [
  {
    hypothesisId: IDS.h1,
    previousRank: 1,
    newRank: 2,
    previousStatus: "LEADING",
    newStatus: "WEAKENED",
    reason: "A controlled comparison reproduced the failure on the previous deployment version.",
    triggeringEvidenceIds: [IDS.ev24],
    occurredAt: "2026-08-21T14:04:00.000Z",
  },
  {
    hypothesisId: IDS.h2,
    previousRank: 2,
    newRank: 1,
    previousStatus: "PLAUSIBLE",
    newStatus: "LEADING",
    reason: "Provider latency and error signatures align directly with customer impact.",
    triggeringEvidenceIds: [IDS.ev31],
    occurredAt: "2026-08-21T14:06:00.000Z",
  },
  {
    hypothesisId: IDS.h3,
    previousRank: 3,
    newRank: 3,
    previousStatus: "CANDIDATE",
    newStatus: "WEAKENED",
    reason: "Database pool health remains within normal operating range.",
    triggeringEvidenceIds: [IDS.ev33],
    occurredAt: "2026-08-21T14:06:30.000Z",
  },
] satisfies HypothesisRankingChange[];

export const CAPABILITIES = [
  { capability: "RUNTIME_STATE", status: "AVAILABLE", freshness: 98, reason: null, updatedAt: SCENARIO_NOW },
  { capability: "DEPLOYMENTS", status: "AVAILABLE", freshness: 96, reason: null, updatedAt: SCENARIO_NOW },
  { capability: "LOG_SEARCH", status: "FAILED", freshness: null, reason: "Provider timeout", updatedAt: SCENARIO_NOW },
  { capability: "METRICS", status: "AVAILABLE", freshness: 98, reason: null, updatedAt: SCENARIO_NOW },
  { capability: "INCIDENT_HISTORY", status: "AVAILABLE", freshness: 91, reason: null, updatedAt: SCENARIO_NOW },
  { capability: "RUNBOOKS", status: "PARTIAL", freshness: 84, reason: "Secondary provider steps only", updatedAt: SCENARIO_NOW },
  { capability: "AI_REASONING", status: "AVAILABLE", freshness: 100, reason: null, updatedAt: SCENARIO_NOW },
  { capability: "REMEDIATION_AUTOMATION", status: "AVAILABLE", freshness: 100, reason: "Policy gated", updatedAt: SCENARIO_NOW },
] satisfies CapabilityState[];

export const INVESTIGATION_INTEGRITY = {
  level: "DEGRADED",
  evidenceCoverage: 72,
  availableCapabilities: 6,
  degradedCapabilities: 1,
  unavailableCapabilities: 1,
  independentEvidenceGroups: 4,
  unresolvedContradictions: 1,
  reasons: ["Log Search failed. Conclusions are limited to available independent signals."],
} satisfies InvestigationIntegrity;

export const RECOMMENDATION = {
  id: IDS.recommendation,
  investigationId: IDS.investigation,
  hypothesisId: IDS.h2,
  actionType: "TRAFFIC_SHIFT",
  summary: "Shift payment traffic to the secondary provider",
  reasoning: "Provider degradation is the leading explanation and the secondary provider remains healthy.",
  technicalRisk: "MEDIUM",
  blastRadius: "SERVICE",
  supportingEvidenceIds: [IDS.ev31],
  contradictingEvidenceIds: [],
  investigationIntegrity: "DEGRADED",
  evidenceCoverage: 72,
  contradictionPressure: 8,
  createdAt: "2026-08-21T14:07:00.000Z",
} satisfies Recommendation;

export const APPROVAL_POLICY = {
  recommendationId: IDS.recommendation,
  requirements: [{ role: "INCIDENT_COMMANDER", count: 1 }],
  policyReasons: ["Traffic shifting affects a production service while investigation integrity is degraded."],
  currentApprovedCount: 0,
  satisfied: false,
} satisfies ApprovalPolicy;

export const VERIFICATION = {
  id: IDS.verification,
  incidentId: IDS.incident,
  remediationId: IDS.remediation,
  status: "PASSED",
  checks: [
    { name: "Payment provider latency", status: "PASSED", before: "2.8s", after: "420ms" },
    { name: "Checkout success rate", status: "PASSED", before: "81.2%", after: "99.4%" },
    { name: "Provider error rate", status: "PASSED", before: "18.4%", after: "0.6%" },
    { name: "Service health", status: "PASSED", before: "DEGRADED", after: "HEALTHY" },
  ],
  completedAt: "2026-08-21T14:18:00.000Z",
} satisfies Verification;

const verificationResults = ["NORMALIZED", "RECOVERED", "DECREASED", "STABLE"] as const;

export const VERIFICATION_CHECKS = VERIFICATION.checks.map((check, index) => ({
  ...check,
  label: check.name,
  result: verificationResults[index],
}));

export const INVESTIGATION_HISTORY = [
  { at: "13:58", event: "Incident acknowledged", detail: "HIGH, checkout-api" },
  { at: "14:01", event: "H1 ranked leading", detail: "deployment timing correlation" },
  { at: "14:04", event: "Controlled comparison contradicts H1", detail: "EV-24, strong contradiction" },
  { at: "14:04", event: "H1 weakened", detail: "leading to weakened" },
  { at: "14:06", event: "Provider evidence supports H2", detail: "EV-31, high quality" },
  { at: "14:06", event: "H2 becomes leading", detail: "plausible to leading" },
  { at: "14:07", event: "Log Search fails", detail: "provider timeout" },
  { at: "14:07", event: "Evidence coverage falls", detail: "72% coverage" },
  { at: "14:07", event: "Investigation integrity becomes DEGRADED", detail: "limited independent signals" },
];

const evidenceDetails: Record<string, string> = {
  "EV-18": "commit 4b19ac2, temporal correlation only",
  "EV-24": "controlled rollback test, independent reproduction",
  "EV-31": "provider-gateway, all checkout regions",
  "EV-33": "41% utilization, stable query latency",
};

const sourceLabels: Record<Evidence["sourceType"], string> = {
  METRIC: "provider metrics",
  LOG: "logs",
  TRACE: "traces",
  DEPLOYMENT: "deployments",
  CHANGE: "change history",
  RUNTIME_STATE: "runtime state",
  ALERT: "alerts",
  TOPOLOGY: "service topology",
  INCIDENT_HISTORY: "incident history",
  RUNBOOK: "runbook",
  HUMAN_OBSERVATION: "human observation",
};

const evidenceSourceLabels: Record<string, string> = {
  "EV-18": "deployments",
  "EV-24": "deployment comparison",
  "EV-31": "provider metrics",
  "EV-33": "service health",
};

const capabilityLabels: Record<CapabilityState["capability"], string> = {
  SERVICE_TOPOLOGY: "Service Topology",
  METRICS: "Metrics",
  LOG_SEARCH: "Log Search",
  TRACE_SEARCH: "Trace Search",
  DEPLOYMENTS: "Deployments",
  CHANGE_HISTORY: "Change History",
  RUNTIME_STATE: "Runtime State",
  ALERTS: "Alerts",
  INCIDENT_HISTORY: "Incident History",
  RUNBOOKS: "Runbooks",
  AI_REASONING: "AI Reasoning",
  REMEDIATION_AUTOMATION: "Remediation Automation",
};

export const getCapabilityLabel = (capability: CapabilityState["capability"]) =>
  capabilityLabels[capability];

export const getEvidenceRelation = (evidenceId: string) => {
  const relation = EVIDENCE_RELATIONS.find((item) => item.evidenceId === evidenceId);
  if (!relation) throw new Error(`Missing evidence relation for ${evidenceId}`);
  return relation;
};

export const getEvidenceQuality = (evidence: Evidence): EvidenceQuality => {
  const score =
    (evidence.reliability +
      evidence.specificity +
      evidence.directness +
      evidence.freshness +
      evidence.temporalRelevance) /
    5;

  if (score >= 80) return "HIGH";
  if (score >= 50) return "MODERATE";
  return "LOW";
};

export const getEvidenceDetail = (evidence: Evidence) => evidenceDetails[evidence.reference] ?? evidence.source;

export const getEvidenceSourceLabel = (evidence: Evidence) =>
  evidenceSourceLabels[evidence.reference] ?? sourceLabels[evidence.sourceType];

export const getHypothesisById = (hypothesisId: string) =>
  HYPOTHESES.find((hypothesis) => hypothesis.id === hypothesisId);

export const getApprovalSummary = (policy: ApprovalPolicy) => {
  const requirement = policy.requirements[0];
  const role = requirement?.role
    ?.split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
  if (!requirement || !role) return "No approval required";
  return requirement.count === 1
    ? `${role} approval required`
    : `${requirement.count} ${role} approvals required`;
};

export const getIncidentOpenedLabel = (startedAt: string, now = SCENARIO_NOW) => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 60_000),
  );
  return `${elapsedMinutes}m ago`;
};
