import {
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesRequestSchema,
  type NotificationPreferences,
  type UpdateNotificationPreferencesRequest,
} from "contracts";

import { axiosClient } from "@/lib/api/axios-client";

export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const response = await axiosClient.get<unknown, unknown>(
      "/settings/notifications",
    );

    return NotificationPreferencesSchema.parse(response);
  };

export const updateNotificationPreferences = async (
  input: UpdateNotificationPreferencesRequest,
): Promise<NotificationPreferences> => {
  const payload = UpdateNotificationPreferencesRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(
    "/settings/notifications",
    payload,
  );

  return NotificationPreferencesSchema.parse(response);
};
