import {
    AnonymousAuthSessionSchema,
    AuthSessionSchema,
    LogoutResponseSchema,
    type AnonymousAuthSession,
    type AuthSession,
    type LogoutResponse
} from "contracts";
import { axiosClient } from "@/lib/api/axios-client";

export const getAuthSession = async (): Promise<AuthSession> => {
    const response = await axiosClient.get<unknown, unknown>("/auth/session");

    return AuthSessionSchema.parse(response);
};

export const logout = async (): Promise<LogoutResponse> => {
    const response = await axiosClient.post<unknown, unknown>("/auth/logout");

    return LogoutResponseSchema.parse(response);
};

export const anonymousSession = (): AnonymousAuthSession => AnonymousAuthSessionSchema.parse({ authenticated: false, oauthError: null });