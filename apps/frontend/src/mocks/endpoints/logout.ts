import { AnonymousAuthSessionSchema, LogoutResponseSchema } from "contracts";
import { http, HttpResponse } from "msw";
import { clearMockSession } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const logout = http.post(apiEndpoint("/auth/logout"), () => {
  AnonymousAuthSessionSchema.parse({ authenticated: false, oauthError: null });
  const response = LogoutResponseSchema.parse({ loggedOut: true });

  clearMockSession();

  return HttpResponse.json(response);
});
