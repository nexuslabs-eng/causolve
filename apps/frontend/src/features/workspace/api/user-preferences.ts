import {
  ServerUserPreferencesSchema,
  UpdateUserPreferencesRequestSchema,
  type ServerUserPreferences,
  type UpdateUserPreferencesRequest,
} from "contracts";
import { axiosClient } from "@/lib/api/axios-client";

export const getUserPreferences = async (): Promise<ServerUserPreferences> => {
  const response = await axiosClient.get<unknown, unknown>(
    "/settings/preferences",
  );

  return ServerUserPreferencesSchema.parse(response);
};

export const updateUserPreferences = async (
  input: UpdateUserPreferencesRequest,
): Promise<ServerUserPreferences> => {
  const payload = UpdateUserPreferencesRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(
    "/settings/preferences",
    payload,
  );

  return ServerUserPreferencesSchema.parse(response);
};
