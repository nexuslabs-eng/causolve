import type { OAuthErrorCode } from "contracts";

const oauthErrorMessages: Record<OAuthErrorCode, string> = {
    OAUTH_AUTHENTICATION_FAILED: "Social authentication failed. Please try again.",
    EMAIL_ALREADY_REGISTERED: "An account with this email already exists."
}

export const getOAuthErrorMessage = (code: OAuthErrorCode | null | undefined) => {
    return code ? oauthErrorMessages[code] : undefined;
};