import { queryOptions } from "@tanstack/react-query";
import { getAuthSession } from "@/features/auth/api/auth-session";
import { queryClient } from "@/lib/query-client";
import type { AuthSession } from "contracts";

export const authSessionQueryKey = ["auth", "session"] as const;

export const authSessionQueryOptions = () =>
    queryOptions({
        queryKey: authSessionQueryKey,
        queryFn: getAuthSession,
        retry: false,
    });

export const refreshAuthSession = () =>
    queryClient.query({
        ...authSessionQueryOptions(),
        staleTime: 0
    });

export const clearOAuthError = () => {
    queryClient.setQueryData<AuthSession>(
        authSessionQueryKey,
        session => {
            if (!session || session.authenticated) return session;

            return { ...session, oauthError: null }
        }
    )
}