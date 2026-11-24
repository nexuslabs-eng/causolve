import { SignupCompletionSchema } from "contracts/onboarding/signup-completion.schema";
import { http, HttpResponse } from "msw";
import { apiError, authSession, mockProfile } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const signupCompletion = http.get(
  apiEndpoint("/onboarding/completion"),
  () => {
    if (
      !authSession.authenticated ||
      authSession.onboarding.status !== "COMPLETED" ||
      !authSession.activeWorkspace ||
      !authSession.membership ||
      !mockProfile
    ) {
      return HttpResponse.json(
        apiError(
          "ONBOARDING_STEP_NOT_ALLOWED",
          "Complete onboarding before viewing its summary.",
        ),
        { status: 409 },
      );
    }

    return HttpResponse.json(
      SignupCompletionSchema.parse({
        user: {
          id: authSession.user.id,
          fullName: authSession.user.fullName,
          email: authSession.user.email,
        },
        workspace: {
          organizationId: authSession.activeWorkspace.organizationId,
          name: authSession.activeWorkspace.name,
          slug: authSession.activeWorkspace.slug,
          teamSize: authSession.activeWorkspace.teamSize,
        },
        profile: mockProfile,
        membership: authSession.membership,
      }),
    );
  },
);
