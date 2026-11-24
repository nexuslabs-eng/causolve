import {
  UpdateWorkspaceSettingsRequestSchema,
  WorkspaceSettingsSchema,
  type UpdateWorkspaceSettingsRequest,
  type WorkspaceSettings,
} from "contracts/settings/workspace-settings.schema";

import { axiosClient } from "@/lib/api/axios-client";

const WORKSPACE_GENERAL_SETTINGS_ENDPOINT = "/workspace/settings/general";

export const updateWorkspaceSettings = async (
  input: UpdateWorkspaceSettingsRequest,
): Promise<WorkspaceSettings> => {
  const payload = UpdateWorkspaceSettingsRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(
    WORKSPACE_GENERAL_SETTINGS_ENDPOINT,
    payload,
  );

  return WorkspaceSettingsSchema.parse(response);
};
