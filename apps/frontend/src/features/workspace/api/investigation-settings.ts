import {
  InvestigationSettingsSchema,
  UpdateInvestigationSettingsRequestSchema,
  type InvestigationSettings,
  type UpdateInvestigationSettingsRequest,
} from "contracts/settings/investigation-settings.schema";

import { axiosClient } from "@/lib/api/axios-client";

const endpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/investigation-settings`;

export const getInvestigationSettings = async (
  organizationId: string,
): Promise<InvestigationSettings> => {
  const response = await axiosClient.get<unknown, unknown>(endpoint(organizationId));

  return InvestigationSettingsSchema.parse(response);
};

export const updateInvestigationSettings = async (
  organizationId: string,
  input: UpdateInvestigationSettingsRequest,
): Promise<InvestigationSettings> => {
  const payload = UpdateInvestigationSettingsRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(endpoint(organizationId), payload);

  return InvestigationSettingsSchema.parse(response);
};
