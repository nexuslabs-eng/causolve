import {
  ApprovalSettingsSchema,
  UpdateApprovalSettingsRequestSchema,
  type ApprovalSettings,
  type UpdateApprovalSettingsRequest,
} from "contracts/settings/approval-settings.schema";

import { axiosClient } from "@/lib/api/axios-client";

const endpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/approval-settings`;

export const getApprovalSettings = async (organizationId: string): Promise<ApprovalSettings> => {
  const response = await axiosClient.get<unknown, unknown>(endpoint(organizationId));

  return ApprovalSettingsSchema.parse(response);
};

export const updateApprovalSettings = async (
  organizationId: string,
  input: UpdateApprovalSettingsRequest,
): Promise<ApprovalSettings> => {
  const payload = UpdateApprovalSettingsRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(endpoint(organizationId), payload);

  return ApprovalSettingsSchema.parse(response);
};
