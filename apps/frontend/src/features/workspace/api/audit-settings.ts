import {
  AuditSettingsSchema,
  UpdateAuditSettingsRequestSchema,
  type AuditSettings,
  type UpdateAuditSettingsRequest,
} from "contracts/settings/audit-settings.schema";

import { axiosClient } from "@/lib/api/axios-client";

const endpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/audit-settings`;

export const getAuditSettings = async (
  organizationId: string,
): Promise<AuditSettings> => {
  const response = await axiosClient.get<unknown, unknown>(
    endpoint(organizationId),
  );

  return AuditSettingsSchema.parse(response);
};

export const updateAuditSettings = async (
  organizationId: string,
  input: UpdateAuditSettingsRequest,
): Promise<AuditSettings> => {
  const response = await axiosClient.patch<unknown, unknown>(
    endpoint(organizationId),
    UpdateAuditSettingsRequestSchema.parse(input),
  );

  return AuditSettingsSchema.parse(response);
};
