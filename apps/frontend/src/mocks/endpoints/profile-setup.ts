import { ProfileSetupRequestSchema, ProfileSetupResponseSchema } from "contracts/onboarding/profile-setup.schema";
import { http, HttpResponse } from "msw";
import { apiError, authSession, setAuthSession, setMockProfile } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const profileSetup = http.post(
    apiEndpoint("/onboarding/profile"), 
    async ({ request }) => {
        const result = ProfileSetupRequestSchema.safeParse(await request.json());

        if (!result.success)
            return HttpResponse.json(
                apiError(
                    "INVALID_PROFILE_REQUEST",
                    "Check your profile details."
                ),
                { status: 422 }
            );
        
            setMockProfile(result.data);

        if (!authSession.authenticated || !authSession.onboarding.workspaceCreated)
            return HttpResponse.json(
                apiError(
                    "ONBOARDING_STEP_NOT_ALLOWED",
                    "Create a workspace before completing your profile.",
                ),
                { status: 409 },
            );



        const completedAt = new Date().toISOString();

        setAuthSession({
            ...authSession,
            membership: authSession.membership
                ? {
                    ...authSession.membership,
                    jobRole: result.data.jobRole,
                }
                : authSession.membership,
            onboarding: {
                status: "COMPLETED",
                nextStep: "COMPLETE",
                emailVerified: true,
                workspaceCreated: true,
                profileCompleted: true,
                completedAt,
            },
        });

        const response = ProfileSetupResponseSchema.parse({
            completed: true,
            onboardingCompletedAt: completedAt,
            nextStep: "COMPLETE"
        });

        return HttpResponse.json(response);
    }
);
