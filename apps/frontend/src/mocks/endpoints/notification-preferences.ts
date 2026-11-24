import {
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesRequestSchema,
} from "contracts/settings/notification-preferences.schema";
import { http, HttpResponse } from "msw";

import { apiEndpoint } from "@/lib/api/api-config";
import {
  apiError,
  authSession,
  notificationPreferences,
  setNotificationPreferences,
} from "@/mocks/utils";

const requireAuthentication = () => {
  if (authSession.authenticated) {
    return null;
  }

  return HttpResponse.json(apiError("UNAUTHENTICATED", "You must be signed in."), { status: 401 });
};

export const getNotificationPreferences = http.get(apiEndpoint("/settings/notifications"), () => {
  const authenticationError = requireAuthentication();

  if (authenticationError) {
    return authenticationError;
  }

  return HttpResponse.json(NotificationPreferencesSchema.parse(notificationPreferences));
});

export const updateNotificationPreferences = http.patch(
  apiEndpoint("/settings/notifications"),
  async ({ request }) => {
    const authenticationError = requireAuthentication();

    if (authenticationError) {
      return authenticationError;
    }

    const result = UpdateNotificationPreferencesRequestSchema.safeParse(await request.json());

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_NOTIFICATION_PREFERENCES", "Invalid notification preferences."),
        { status: 422 },
      );
    }

    const updatedPreferences = {
      ...notificationPreferences,
      ...result.data,
    };

    setNotificationPreferences(updatedPreferences);

    return HttpResponse.json(NotificationPreferencesSchema.parse(updatedPreferences));
  },
);
