import { ApiErrorSchema, AuthSessionSchema, ProfileSetupRequestSchema, type AuthSession, type ProfileSetupRequest } from "contracts";

export const MOCK_EMAIL_OTP = "123456";
export const MOCK_USER_ID = "16161616-1616-4616-8616-161616161616";
export const MOCK_ORGANIZATION_ID = "17171717-1717-4717-8717-171717171717";
export const RESET_PASSWORD_TOKEN = "0123456789abcdef0123456789abcdef";
export const MOCK_WORKSPACE_NAME = "Acme Engineering";
export const MOCK_WORKSPACE_SLUG = "acme-engineering";

export let authSession: AuthSession = AuthSessionSchema.parse({
    authenticated: false,
    oauthError: null
});

export const setAuthSession = (session: unknown) => {
    authSession = AuthSessionSchema.parse(session);
}

interface Error {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
        requestId?: string | undefined;
    };
};

type ApiError = (code: string, message: string) => Error;

export const apiError: ApiError = (code, message) =>
    ApiErrorSchema.parse({
        error: { code, message },
    });

export let mockProfile: ProfileSetupRequest | null = null;

export const setMockProfile = (profile: unknown) => {
    mockProfile = ProfileSetupRequestSchema.parse(profile);
};

export const resetMockProfile = () => {
    mockProfile = null;
};

export const resetMockState = () => {
    setAuthSession({ authenticated: false, oauthError: null });
    resetMockProfile();
};