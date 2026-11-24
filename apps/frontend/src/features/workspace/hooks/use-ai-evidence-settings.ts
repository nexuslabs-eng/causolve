import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAiEvidenceSettings,
  updateAiEvidenceSettings,
} from "@/features/workspace/api/ai-evidence-settings";

const queryKey = (organizationId: string) =>
  ["workspace", "ai-evidence-settings", organizationId] as const;

export const useAiEvidenceSettings = (organizationId: string) => {
  return useQuery({
    queryKey: queryKey(organizationId),
    queryFn: () => getAiEvidenceSettings(organizationId),
    enabled: Boolean(organizationId),
  });
};

export const useUpdateAiEvidenceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string;
      input: Parameters<typeof updateAiEvidenceSettings>[1];
    }) => updateAiEvidenceSettings(organizationId, input),

    onSuccess: (settings, variables) => {
      queryClient.setQueryData(queryKey(variables.organizationId), settings);
    },
  });
};
