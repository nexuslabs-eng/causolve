import {
    AcceptInvitationRequestSchema,
    AcceptInvitationResponseSchema,
    InvitationPreviewSchema,
    InvitationTokenSchema,
    type AcceptInvitationRequest,
    type AcceptInvitationResponse,
    type InvitationPreview,
    type InvitationToken,
} from "contracts";

import { axiosClient } from "@/lib/api/axios-client";

export const getInvitationPreview = async (
    token: InvitationToken,
): Promise<InvitationPreview> => {
    const response = await axiosClient.get<unknown, unknown>(
        "/invitations/preview",
        {
            params: { token },
        },
    );

    return InvitationPreviewSchema.parse(response);
};

export const acceptInvitation = async (
    input: AcceptInvitationRequest,
): Promise<AcceptInvitationResponse> => {
    const payload = AcceptInvitationRequestSchema.parse(input);

    const response = await axiosClient.post<unknown, unknown>(
        "/invitations/accept",
        payload,
    );

    return AcceptInvitationResponseSchema.parse(response);
};

export const parseInvitationToken = (
    value: string | null,
): InvitationToken | undefined => {
    const result = InvitationTokenSchema.safeParse(value);

    return result.success ? result.data : undefined;
};