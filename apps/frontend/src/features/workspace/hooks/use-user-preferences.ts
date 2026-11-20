import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserPreferencesRequest } from "contracts";
import { updateUserPreferences } from "@/features/workspace/api/user-preferences";
import {
  userPreferencesQueryKey,
  userPreferencesQueryOptions,
} from "@/features/workspace/queries/user-preferences-query";

export const useUserPreferences = () => useQuery(userPreferencesQueryOptions());

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserPreferencesRequest) =>
      updateUserPreferences(input),

    onSuccess: (preferences) => {
      queryClient.setQueryData(userPreferencesQueryKey, preferences);
    },
  });
};
