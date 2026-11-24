import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getApprovalSettings,
  updateApprovalSettings,
} from "@/features/workspace/api/approval-settings";

const queryKey = (organizationId: string) =>
  ["workspace", "approval-settings", organizationId] as const;

export const useApprovalSettings = (organizationId: string) =>
  useQuery({
    queryKey: queryKey(organizationId),
    queryFn: () => getApprovalSettings(organizationId),
    enabled: Boolean(organizationId),
  });

export const useUpdateApprovalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string;
      input: Parameters<typeof updateApprovalSettings>[1];
    }) => updateApprovalSettings(organizationId, input),
    onSuccess: (settings, variables) => {
      queryClient.setQueryData(queryKey(variables.organizationId), settings);
    },
  });
};
