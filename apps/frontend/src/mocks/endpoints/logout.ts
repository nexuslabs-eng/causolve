import { AnonymousAuthSessionSchema, LogoutResponseSchema } from "contracts";
import { http, HttpResponse } from "msw";
import { setAuthSession } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const logout = http.post(
    apiEndpoint("/auth/logout"),
    () => {
        const anonymousSession = AnonymousAuthSessionSchema.parse({ authenticated: false, oauthError: null });
        const response = LogoutResponseSchema.parse({ loggedOut: true })

        setAuthSession(anonymousSession);

        return HttpResponse.json(response);
    },
);