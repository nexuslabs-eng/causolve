import { useQuery } from "@tanstack/react-query";
import { commandCenterQueryOptions } from "../api/command-command-center";

export const useCommandCenter = (incidentId: string) =>
  useQuery(commandCenterQueryOptions(incidentId));
