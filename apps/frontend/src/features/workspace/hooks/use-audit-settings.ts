import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAuditSettings, updateAuditSettings } from "@/features/workspace/api/audit-settings";

const queryKey = (organizationId: string) =>
  ["workspace", "audit-settings", organizationId] as const;

export const useAuditSettings = (organizationId: string) =>
  useQuery({
    queryKey: queryKey(organizationId),
    queryFn: () => getAuditSettings(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
  });

export const useUpdateAuditSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string;
      input: Parameters<typeof updateAuditSettings>[1];
    }) => updateAuditSettings(organizationId, input),
    onSuccess: (settings, variables) => {
      queryClient.setQueryData(queryKey(variables.organizationId), settings);
    },
  });
};
