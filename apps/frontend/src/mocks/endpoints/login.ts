import { LoginRequestSchema, LoginResponseSchema } from "contracts";
import { http, HttpResponse } from "msw";
import {
  apiError,
  MOCK_ORGANIZATION_ID,
  MOCK_USER_ID,
  MOCK_WORKSPACE_NAME,
  MOCK_WORKSPACE_SLUG,
  setAuthSession,
} from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const login = http.post(
  apiEndpoint("/auth/login"),
  async ({ request }) => {
    const result = LoginRequestSchema.safeParse(await request.json());

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_CREDENTIALS", "Invalid email or password."),
        { status: 401 },
      );
    }

    const user = {
      id: MOCK_USER_ID,
      fullName: "Samuel Adeyemi",
      email: result.data.email,
      emailVerified: true,
    };

    setAuthSession({
      authenticated: true,
      user,
      activeWorkspace: {
        organizationId: MOCK_ORGANIZATION_ID,
        name: MOCK_WORKSPACE_NAME,
        slug: MOCK_WORKSPACE_SLUG,
        teamSize: "SIX_TO_TWENTY",
      },
      membership: {
        role: "ADMIN",
      },
      onboarding: {
        status: "COMPLETED",
        nextStep: "COMPLETE",
        emailVerified: true,
        workspaceCreated: true,
        profileCompleted: true,
        completedAt: new Date().toISOString(),
      },
    });

    return HttpResponse.json(
      LoginResponseSchema.parse({
        user,
        onboarding: {
          status: "COMPLETED",
          nextStep: "COMPLETE",
        },
      }),
    );
  },
);
