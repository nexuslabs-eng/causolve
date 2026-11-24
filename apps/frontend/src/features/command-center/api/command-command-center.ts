import { queryOptions } from "@tanstack/react-query";
import { getCommandCenter } from "./get-command-center";

export const commandCenterQueryKey = (incidentId: string) =>
  ["incidents", incidentId, "command-center"] as const;

export const commandCenterQueryOptions = (incidentId: string) =>
  queryOptions({
    queryKey: commandCenterQueryKey(incidentId),
    queryFn: () => getCommandCenter(incidentId),
  });
