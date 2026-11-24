import {
  AiEvidenceSettingsSchema,
  UpdateAiEvidenceSettingsRequestSchema,
  type AiEvidenceSettings,
  type UpdateAiEvidenceSettingsRequest,
} from "contracts/settings/ai-evidence-settings.schema";

import { axiosClient } from "@/lib/api/axios-client";

const endpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/ai-evidence-settings`;

export const getAiEvidenceSettings = async (
  organizationId: string,
): Promise<AiEvidenceSettings> => {
  const response = await axiosClient.get<unknown, unknown>(endpoint(organizationId));

  return AiEvidenceSettingsSchema.parse(response);
};

export const updateAiEvidenceSettings = async (
  organizationId: string,
  input: UpdateAiEvidenceSettingsRequest,
): Promise<AiEvidenceSettings> => {
  const payload = UpdateAiEvidenceSettingsRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(endpoint(organizationId), payload);

  return AiEvidenceSettingsSchema.parse(response);
};
