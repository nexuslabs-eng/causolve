import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInvestigationSettings,
  updateInvestigationSettings,
} from "@/features/workspace/api/investigation-settings";

const queryKey = (organizationId: string) =>
  ["workspace", "investigation-settings", organizationId] as const;

export const useInvestigationSettings = (organizationId: string) =>
  useQuery({
    queryKey: queryKey(organizationId),
    queryFn: () => getInvestigationSettings(organizationId),
    enabled: Boolean(organizationId),
  });

export const useUpdateInvestigationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string;
      input: Parameters<typeof updateInvestigationSettings>[1];
    }) => updateInvestigationSettings(organizationId, input),
    onSuccess: (settings, variables) => {
      queryClient.setQueryData(queryKey(variables.organizationId), settings);
    },
  });
};
