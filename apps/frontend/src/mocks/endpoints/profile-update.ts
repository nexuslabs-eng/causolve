import { AuthSessionSchema } from "contracts/auth/auth-session.schema";
import { UpdateProfileRequestSchema } from "contracts/profile/profile.schema";
import { http, HttpResponse } from "msw";

import { apiEndpoint } from "@/lib/api/api-config";
import { apiError, authSession, setAuthSession } from "@/mocks/utils";

export const profileUpdate = http.patch(apiEndpoint("/auth/profile"), async ({ request }) => {
  if (!authSession.authenticated) {
    return HttpResponse.json(apiError("UNAUTHENTICATED", "You must be signed in."), {
      status: 401,
    });
  }

  const result = UpdateProfileRequestSchema.safeParse(await request.json());

  if (!result.success) {
    return HttpResponse.json(apiError("INVALID_PROFILE_REQUEST", "Enter valid profile details."), {
      status: 422,
    });
  }

  const updatedSession = {
    ...authSession,
    membership: authSession.membership
      ? {
          ...authSession.membership,
          ...(result.data.jobRole !== undefined && {
            jobRole: result.data.jobRole,
          }),
        }
      : authSession.membership,
    user: {
      ...authSession.user,
      ...(result.data.fullName !== undefined && {
        fullName: result.data.fullName,
      }),
    },
  };

  setAuthSession(updatedSession);

  return HttpResponse.json(AuthSessionSchema.parse(updatedSession));
});
