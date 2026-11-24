import { queryOptions } from "@tanstack/react-query";

import { getNotificationPreferences } from "@/features/workspace/api/notification-preferences";

export const notificationPreferencesQueryKey = ["settings", "notifications"] as const;

export const notificationPreferencesQueryOptions = () =>
  queryOptions({
    queryKey: notificationPreferencesQueryKey,
    queryFn: getNotificationPreferences,
    retry: false,
  });
