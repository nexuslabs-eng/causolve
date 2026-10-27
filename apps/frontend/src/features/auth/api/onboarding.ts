import {
    WorkspaceSetupRequestSchema,
    WorkspaceSetupResponseSchema,
    WorkspaceSlugSchema,
    WorkspaceSlugAvailabilityResponseSchema,
    ProfileSetupRequestSchema,
    ProfileSetupResponseSchema,
    type WorkspaceSetupRequest,
    type WorkspaceSetupResponse,
    type WorkspaceSlug,
    type WorkspaceSlugAvailabilityResponse,
    type ProfileSetupRequest,
    type ProfileSetupResponse,
    type SignupCompletion,
    SignupCompletionSchema
} from "contracts";
import { axiosClient } from "@/lib/api/axios-client";

export const createWorkspace = async (
    input: WorkspaceSetupRequest
): Promise<WorkspaceSetupResponse> => {
    const payload = WorkspaceSetupRequestSchema.parse(input);

    const response = await axiosClient.post<unknown, unknown>(
        "/onboarding/workspace",
        payload
    );

    return WorkspaceSetupResponseSchema.parse(response);
};

export const completeProfile = async (
    input: ProfileSetupRequest
): Promise<ProfileSetupResponse> => {
    const payload = ProfileSetupRequestSchema.parse(input);
    const response = await axiosClient.post<unknown, unknown>("/onboarding/profile", payload);

    return ProfileSetupResponseSchema.parse(response);
};

export const getSignupCompletion =
    async (): Promise<SignupCompletion> => {
        const response = await axiosClient.get<unknown, unknown>(
            "/onboarding/completion",
        );

        return SignupCompletionSchema.parse(response);
    };

export const checkWorkspaceSlugAvailability = async (
    slug: WorkspaceSlug,
    signal?: AbortSignal,
): Promise<WorkspaceSlugAvailabilityResponse> => {
    const validSlug = WorkspaceSlugSchema.parse(slug);

    const response = await axiosClient.get<unknown, unknown>(
        "/onboarding/workspace-slug-availability",
        {
            params: { slug: validSlug },
            signal,
        },
    );

    return WorkspaceSlugAvailabilityResponseSchema.parse(response);
};