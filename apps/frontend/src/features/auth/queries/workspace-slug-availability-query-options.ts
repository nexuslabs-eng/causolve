import { queryOptions } from "@tanstack/react-query";
import type { WorkspaceSlug } from "contracts";
import { checkWorkspaceSlugAvailability } from "@/features/auth/api/onboarding";

export const workspaceSlugAvailabilityQueryOptions = (
    slug: WorkspaceSlug | undefined,
) =>
    queryOptions({
        queryKey: ["onboarding", "workspace-slug-availability", slug],
        enabled: Boolean(slug),
        staleTime: 30000,
        gcTime: 5 * 60000,
        retry: false,
        queryFn: ({ signal }) => {
            if (!slug)
                throw new Error("Workspace slug is required");

            return checkWorkspaceSlugAvailability(slug, signal);
        },
    });