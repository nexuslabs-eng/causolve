import {
  WorkspaceSetupRequestSchema,
  WorkspaceSetupResponseSchema,
} from "contracts/onboarding/workspace-setup.schema";
import { http, HttpResponse } from "msw";
import {
  apiError,
  authSession,
  MOCK_ORGANIZATION_ID,
  setAuthSession,
} from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const workspaceSetup = http.post(
  apiEndpoint("/onboarding/workspace"),
  async ({ request }) => {
    const result = WorkspaceSetupRequestSchema.safeParse(await request.json());

    if (!result.success)
      return HttpResponse.json(
        apiError("INVALID_WORKSPACE_REQUEST", "Check your workspace details."),
        { status: 422 },
      );

    if (!authSession.authenticated || !authSession.onboarding.emailVerified)
      return HttpResponse.json(
        apiError(
          "ONBOARDING_STEP_NOT_ALLOWED",
          "Verify your email before creating a workspace.",
        ),
        { status: 409 },
      );

    setAuthSession({
      ...authSession,
      activeWorkspace: {
        organizationId: MOCK_ORGANIZATION_ID,
        name: result.data.name,
        slug: result.data.slug,
        teamSize: result.data.teamSize,
      },
      membership: {
        role: "ADMIN",
      },
      onboarding: {
        ...authSession.onboarding,
        nextStep: "PROFILE",
        workspaceCreated: true,
      },
    });

    const response = WorkspaceSetupResponseSchema.parse({
      organizationId: MOCK_ORGANIZATION_ID,
      workspaceName: result.data.name,
      workspaceSlug: result.data.slug,
      nextStep: "PROFILE",
    });

    return HttpResponse.json(response, { status: 201 });
  },
);
