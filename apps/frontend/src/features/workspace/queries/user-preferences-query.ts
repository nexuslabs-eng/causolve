import { queryOptions } from "@tanstack/react-query";
import { getUserPreferences } from "@/features/workspace/api/user-preferences";

export const userPreferencesQueryKey = ["settings", "preferences"] as const;

export const userPreferencesQueryOptions = () =>
  queryOptions({
    queryKey: userPreferencesQueryKey,
    queryFn: getUserPreferences,
    retry: false,
  });
