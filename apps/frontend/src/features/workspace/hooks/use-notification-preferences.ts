import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  notificationPreferencesQueryKey,
  notificationPreferencesQueryOptions,
} from "@/features/workspace/queries/notification-preferences-query";
import type { UpdateNotificationPreferencesRequest } from "contracts/settings/notification-preferences.schema";
import { updateNotificationPreferences } from "@/features/workspace/api/notification-preferences";

export const useNotificationPreferences = () =>
  useQuery(notificationPreferencesQueryOptions());

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesRequest) =>
      updateNotificationPreferences(input),

    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationPreferencesQueryKey, preferences);
    },
  });
};
