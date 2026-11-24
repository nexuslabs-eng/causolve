import { z } from "zod";

export const RoleSchema = z.enum(["OBSERVER", "ENGINEER", "INCIDENT_COMMANDER", "ADMIN"]);

export const IncidentSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const IncidentStatusSchema = z.enum([
  "DETECTED",
  "ACKNOWLEDGED",
  "INVESTIGATING",
  "MITIGATING",
  "MONITORING",
  "RESOLVED",
]);

export const InvestigationStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "DEGRADED",
  "FAILED",
]);

export const HypothesisStatusSchema = z.enum([
  "CANDIDATE",
  "PLAUSIBLE",
  "LEADING",
  "WEAKENED",
  "INVALIDATED",
  "CONFIRMED",
]);

export const ContradictionSeveritySchema = z.enum(["WEAK", "MODERATE", "STRONG", "INVALIDATING"]);

export const IntegrityLevelSchema = z.enum(["HIGH", "MODERATE", "DEGRADED", "LOW"]);

export const CapabilityStatusSchema = z.enum([
  "AVAILABLE",
  "PARTIAL",
  "STALE",
  "UNAVAILABLE",
  "FAILED",
]);

export const EvidenceSourceTypeSchema = z.enum([
  "METRIC",
  "LOG",
  "TRACE",
  "DEPLOYMENT",
  "CHANGE",
  "RUNTIME_STATE",
  "ALERT",
  "TOPOLOGY",
  "INCIDENT_HISTORY",
  "RUNBOOK",
  "HUMAN_OBSERVATION",
]);

export const RecommendationActionTypeSchema = z.enum([
  "ROLLBACK",
  "RESTART_SERVICE",
  "TRAFFIC_SHIFT",
  "MANUAL_PROCEDURE",
  "NO_ACTION",
]);

export const TechnicalRiskSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const BlastRadiusSchema = z.enum(["SERVICE", "MULTI_SERVICE", "REGION", "MULTI_REGION"]);

export const ApprovalDecisionSchema = z.enum(["APPROVED", "REJECTED"]);

export const RemediationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "EXECUTING",
  "SUCCEEDED",
  "FAILED",
]);

export const RemediationExecutionModeSchema = z.enum(["SIMULATED", "MANUAL", "AUTOMATED"]);

export const VerificationStatusSchema = z.enum(["PENDING", "RUNNING", "PASSED", "FAILED"]);

export const VerificationCheckStatusSchema = z.enum(["PASSED", "FAILED", "UNKNOWN"]);

export const CapabilityNameSchema = z.enum([
  "SERVICE_TOPOLOGY",
  "METRICS",
  "LOG_SEARCH",
  "TRACE_SEARCH",
  "DEPLOYMENTS",
  "CHANGE_HISTORY",
  "RUNTIME_STATE",
  "ALERTS",
  "INCIDENT_HISTORY",
  "RUNBOOKS",
  "AI_REASONING",
  "REMEDIATION_AUTOMATION",
]);

export const ServiceHealthStatusSchema = z.enum(["HEALTHY", "DEGRADED", "UNAVAILABLE", "UNKNOWN"]);

export type Role = z.infer<typeof RoleSchema>;
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;
export type InvestigationStatus = z.infer<typeof InvestigationStatusSchema>;
export type HypothesisStatus = z.infer<typeof HypothesisStatusSchema>;
export type ContradictionSeverity = z.infer<typeof ContradictionSeveritySchema>;
export type IntegrityLevel = z.infer<typeof IntegrityLevelSchema>;
export type CapabilityStatus = z.infer<typeof CapabilityStatusSchema>;
export type EvidenceSourceType = z.infer<typeof EvidenceSourceTypeSchema>;
