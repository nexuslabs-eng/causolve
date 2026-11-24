import {
  AiEvidenceSettingsSchema,
  UpdateAiEvidenceSettingsRequestSchema,
  type AiEvidenceSettings,
} from "contracts/settings/ai-evidence-settings.schema";
import {
  ApprovalSettingsSchema,
  UpdateApprovalSettingsRequestSchema,
  type ApprovalSettings,
} from "contracts/settings/approval-settings.schema";
import {
  AuditSettingsSchema,
  UpdateAuditSettingsRequestSchema,
  type AuditSettings,
} from "contracts/settings/audit-settings.schema";
import {
  InvestigationSettingsSchema,
  UpdateInvestigationSettingsRequestSchema,
  type InvestigationSettings,
} from "contracts/settings/investigation-settings.schema";
import { http, HttpResponse } from "msw";
import { apiEndpoint } from "@/lib/api/api-config";
import { apiError } from "@/mocks/utils";
import { getAuthSession } from "@/mocks/auth-state";
import { z } from "zod";

const SETTINGS_STORAGE_KEY = "causolve_mock_workspace_settings_pages";

const DEFAULT_INVESTIGATION_SETTINGS: InvestigationSettings = {
  autoStartInvestigations: true,
  evidenceCollectionTimeout: {
    value: 15,
    unit: "MINUTES",
  },
  maxEvidenceItems: 100,
  requireEvidenceAttribution: true,
};

const DEFAULT_AI_EVIDENCE_SETTINGS: AiEvidenceSettings = {
  aiAssistanceEnabled: true,
  humanApprovalRequired: true,
  externalEvidenceAllowed: false,
  evidenceRetentionDays: 365,
};

const DEFAULT_APPROVAL_SETTINGS: ApprovalSettings = {
  requireApprovalBeforeRemediation: true,
  minimumRequiredApprovals: 2,
  automaticRemediationEnabled: false,
  approvalTimeoutHours: 24,
};

const DEFAULT_AUDIT_SETTINGS: AuditSettings = {
  retentionPeriodDays: 365,
  exportPermission: "ADMINS_ONLY",
  eventCategories: [
    "MEMBERSHIP",
    "SETTINGS",
    "INTEGRATIONS",
    "INCIDENTS",
    "INVESTIGATIONS",
    "REMEDIATION",
  ],
  complianceArchivalEnabled: true,
};

const requireWorkspace = (organizationId: string) => {
  const session = getAuthSession();

  if (!session.authenticated) {
    return HttpResponse.json(apiError("UNAUTHENTICATED", "You must be signed in."), {
      status: 401,
    });
  }

  if (session.activeWorkspace?.organizationId !== organizationId) {
    return HttpResponse.json(apiError("ORGANIZATION_NOT_FOUND", "Organization not found."), {
      status: 404,
    });
  }

  return null;
};

const readStore = (): Record<string, Record<string, unknown>> => {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, Record<string, unknown>>)
      : {};
  } catch {
    return {};
  }
};

const readStored = <T>(organizationId: string, key: string, schema: z.ZodType<T>, fallback: T) => {
  const stored = readStore()[organizationId]?.[key];
  const result = schema.safeParse(stored);

  return result.success ? result.data : schema.parse(fallback);
};

const writeStored = <T>(organizationId: string, key: string, settings: T) => {
  const store = readStore();
  store[organizationId] = {
    ...store[organizationId],
    [key]: settings,
  };
  globalThis.localStorage?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(store));
};

const readRequestBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export const getInvestigationSettings = http.get(
  apiEndpoint("/organizations/:organizationId/investigation-settings"),
  ({ params }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    return HttpResponse.json(
      readStored(
        organizationId,
        "investigation",
        InvestigationSettingsSchema,
        DEFAULT_INVESTIGATION_SETTINGS,
      ),
    );
  },
);

export const updateInvestigationSettings = http.patch(
  apiEndpoint("/organizations/:organizationId/investigation-settings"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    const result = UpdateInvestigationSettingsRequestSchema.safeParse(
      await readRequestBody(request),
    );

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_INVESTIGATION_SETTINGS", "Invalid investigation settings."),
        { status: 422 },
      );
    }

    writeStored(organizationId, "investigation", result.data);
    return HttpResponse.json(InvestigationSettingsSchema.parse(result.data));
  },
);

export const getAiEvidenceSettings = http.get(
  apiEndpoint("/organizations/:organizationId/ai-evidence-settings"),
  ({ params }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    return HttpResponse.json(
      readStored(
        organizationId,
        "aiEvidence",
        AiEvidenceSettingsSchema,
        DEFAULT_AI_EVIDENCE_SETTINGS,
      ),
    );
  },
);

export const updateAiEvidenceSettings = http.patch(
  apiEndpoint("/organizations/:organizationId/ai-evidence-settings"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    const result = UpdateAiEvidenceSettingsRequestSchema.safeParse(await readRequestBody(request));

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_AI_EVIDENCE_SETTINGS", "Invalid AI and evidence settings."),
        { status: 422 },
      );
    }

    writeStored(organizationId, "aiEvidence", result.data);
    return HttpResponse.json(AiEvidenceSettingsSchema.parse(result.data));
  },
);

export const getApprovalSettings = http.get(
  apiEndpoint("/organizations/:organizationId/approval-settings"),
  ({ params }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    return HttpResponse.json(
      readStored(organizationId, "approval", ApprovalSettingsSchema, DEFAULT_APPROVAL_SETTINGS),
    );
  },
);

export const updateApprovalSettings = http.patch(
  apiEndpoint("/organizations/:organizationId/approval-settings"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    const result = UpdateApprovalSettingsRequestSchema.safeParse(await readRequestBody(request));

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_APPROVAL_SETTINGS", "Invalid approval settings."),
        { status: 422 },
      );
    }

    writeStored(organizationId, "approval", result.data);
    return HttpResponse.json(ApprovalSettingsSchema.parse(result.data));
  },
);

export const getAuditSettings = http.get(
  apiEndpoint("/organizations/:organizationId/audit-settings"),
  ({ params }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    return HttpResponse.json(
      readStored(organizationId, "audit", AuditSettingsSchema, DEFAULT_AUDIT_SETTINGS),
    );
  },
);

export const updateAuditSettings = http.patch(
  apiEndpoint("/organizations/:organizationId/audit-settings"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);

    if (authenticationError) return authenticationError;

    const result = UpdateAuditSettingsRequestSchema.safeParse(await readRequestBody(request));

    if (!result.success) {
      return HttpResponse.json(apiError("INVALID_AUDIT_SETTINGS", "Invalid audit settings."), {
        status: 422,
      });
    }

    writeStored(organizationId, "audit", result.data);
    return HttpResponse.json(AuditSettingsSchema.parse(result.data));
  },
);
