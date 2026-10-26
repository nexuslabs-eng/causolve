import { WorkspaceSlugAvailabilityResponseSchema, WorkspaceSlugSchema } from "contracts";
import { http, HttpResponse } from "msw";
import { apiError, authSession } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

const unavailableSlugs = new Set(["causolve", "incident-command"]);

export const workspaceSlugAvailability = http.get(
    apiEndpoint("/onboarding/workspace-slug-availability"),
    ({ request }) => {
        const url = new URL(request.url);
        const result = WorkspaceSlugSchema.safeParse(url.searchParams.get("slug"));

        if (!result.success)
            return HttpResponse.json(
                apiError(
                    "INVALID_WORKSPACE_REQUEST",
                    "Enter a valid workspace URL."
                ),
                { status: 422 },
            );

        const belongsToCurrentWorkspace = 
            authSession.authenticated && authSession.activeWorkspace?.slug === result.data;

        return HttpResponse.json(
            WorkspaceSlugAvailabilityResponseSchema.parse({
                slug: result.data,
                available: belongsToCurrentWorkspace || !unavailableSlugs.has(result.data)
            }),
        );
    },
);