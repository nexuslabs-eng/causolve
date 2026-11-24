import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthSession } from "contracts/auth/auth-session.schema";
import type { UpdateWorkspaceSettingsRequest } from "contracts/settings/workspace-settings.schema";

import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { updateWorkspaceSettings } from "@/features/workspace/api/workspace-settings";

export const useUpdateWorkspaceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceSettingsRequest) =>
      updateWorkspaceSettings(input),

    onSuccess: (settings) => {
      queryClient.setQueryData<AuthSession>(authSessionQueryKey, (session) => {
        if (!session || !session.authenticated || !session.activeWorkspace) {
          return session;
        }

        return {
          ...session,
          activeWorkspace: {
            ...session.activeWorkspace,
            name: settings.name,
            slug: settings.slug,
            teamSize: settings.teamSize,
          },
        };
      });
    },
  });
};
