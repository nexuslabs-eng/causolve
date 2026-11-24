import type {
  CreateInvitationRequest,
  CreateInvitationResponse,
} from "contracts/invitations/create-invitation.schema";
import { createInvitation } from "@/features/workspace/api/invitations";

export const sendInvitations = async (
  organizationId: string,
  invitations: CreateInvitationRequest[],
): Promise<CreateInvitationResponse[]> => {
  const responses: CreateInvitationResponse[] = [];

  for (const invitation of invitations) {
    const response = await createInvitation(organizationId, invitation);

    responses.push(response);
  }

  return responses;
};
