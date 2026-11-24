import {
  CreateInvitationRequestSchema,
  CreateInvitationResponseSchema,
  InvitationListResponseSchema,
  ResendInvitationResponseSchema,
  RevokeInvitationResponseSchema,
  type CreateInvitationRequest,
  type CreateInvitationResponse,
  type InvitationListResponse,
  type ResendInvitationResponse,
  type RevokeInvitationResponse,
} from "contracts/invitations/index";
import { axiosClient } from "@/lib/api/axios-client";

const invitationEndpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/invitations`;

export const createInvitation = async (
  organizationId: string,
  input: CreateInvitationRequest,
): Promise<CreateInvitationResponse> => {
  const payload = CreateInvitationRequestSchema.parse(input);

  const response = await axiosClient.post<unknown, unknown>(
    invitationEndpoint(organizationId),
    payload,
  );

  return CreateInvitationResponseSchema.parse(response);
};

export const getInvitations = async (
  organizationId: string,
  page = 1,
  limit = 10,
): Promise<InvitationListResponse> => {
  const response = await axiosClient.get<unknown, unknown>(
    `${invitationEndpoint(organizationId)}?page=${page}&limit=${limit}`,
  );

  return InvitationListResponseSchema.parse(response);
};

export const resendInvitation = async (
  organizationId: string,
  invitationId: string,
): Promise<ResendInvitationResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    `${invitationEndpoint(organizationId)}/${encodeURIComponent(invitationId)}/resend`,
  );

  return ResendInvitationResponseSchema.parse(response);
};

export const revokeInvitation = async (
  organizationId: string,
  invitationId: string,
): Promise<RevokeInvitationResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    `${invitationEndpoint(organizationId)}/${encodeURIComponent(invitationId)}/revoke`,
  );

  return RevokeInvitationResponseSchema.parse(response);
};
