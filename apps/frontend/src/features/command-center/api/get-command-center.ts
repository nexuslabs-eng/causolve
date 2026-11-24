import { CommandCenterSchema, type CommandCenter } from "contracts/incidents/command-center.schema";
import { axiosClient } from "@/lib/api/axios-client";

export const getCommandCenter = async (incidentId: string): Promise<CommandCenter> => {
  const response = await axiosClient.get<unknown, unknown>(
    `/incidents/${encodeURIComponent(incidentId)}/command-center`,
  );

  return CommandCenterSchema.parse(response);
};
