import { axiosClient } from "@/lib/api/axios-client";
import {
    CreateInvitationRequestSchema,
    CreateInvitationResponseSchema,
    type CreateInvitationRequest,
    type CreateInvitationResponse
} from "contracts";

export const createInvitation = async (
    organizationId: string,
    input: CreateInvitationRequest,
): Promise<CreateInvitationResponse> => {
    const payload = CreateInvitationRequestSchema.parse(input);

    const response = await axiosClient.post<unknown, unknown>(
        `/organizations/${encodeURIComponent(organizationId)}/invitations`,
        payload,
    );

    return CreateInvitationResponseSchema.parse(response);
}