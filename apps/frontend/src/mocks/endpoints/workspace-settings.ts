import {
  UpdateWorkspaceSettingsRequestSchema,
  WorkspaceSettingsSchema,
} from "contracts/settings/workspace-settings.schema";
import { http, HttpResponse } from "msw";
import { apiEndpoint } from "@/lib/api/api-config";
import { apiError, authSession, setAuthSession } from "@/mocks/utils";
import { getAuthSession } from "@/mocks/auth-state";

const STORAGE_KEY = "causolve_mock_workspace_settings";

const requireWorkspaceAuthentication = () => {
  if (!authSession.authenticated) {
    return HttpResponse.json(
      apiError("UNAUTHENTICATED", "You must be signed in."),
      { status: 401 },
    );
  }

  if (!authSession.activeWorkspace) {
    return HttpResponse.json(
      apiError("WORKSPACE_REQUIRED", "You do not have an active workspace."),
      { status: 404 },
    );
  }

  return null;
};

const getStoredSettings = () => {
  const session = getAuthSession();

  if (!session.authenticated || !session.activeWorkspace) {
    return null;
  }

  const fallback = {
    organizationId: session.activeWorkspace.organizationId,
    name: session.activeWorkspace.name,
    slug: session.activeWorkspace.slug,
    teamSize: session.activeWorkspace.teamSize,
  };

  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!stored) {
      return WorkspaceSettingsSchema.parse(fallback);
    }

    const parsed = WorkspaceSettingsSchema.safeParse(JSON.parse(stored));

    return parsed.success
      ? parsed.data
      : WorkspaceSettingsSchema.parse(fallback);
  } catch {
    return WorkspaceSettingsSchema.parse(fallback);
  }
};

const persistSettings = (
  settings: ReturnType<typeof WorkspaceSettingsSchema.parse>,
) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const getWorkspaceSettings = http.get(
  apiEndpoint("/workspace/settings/general"),
  () => {
    const authenticationError = requireWorkspaceAuthentication();

    if (authenticationError) {
      return authenticationError;
    }

    const settings = getStoredSettings();

    if (!settings) {
      return HttpResponse.json(
        apiError("WORKSPACE_NOT_FOUND", "Workspace settings were not found."),
        { status: 404 },
      );
    }

    return HttpResponse.json(WorkspaceSettingsSchema.parse(settings));
  },
);

export const updateWorkspaceSettings = http.patch(
  apiEndpoint("/workspace/settings/general"),
  async ({ request }) => {
    const authenticationError = requireWorkspaceAuthentication();

    if (authenticationError) {
      return authenticationError;
    }

    const result = UpdateWorkspaceSettingsRequestSchema.safeParse(
      await request.json(),
    );

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_WORKSPACE_SETTINGS", "Invalid workspace settings."),
        { status: 422 },
      );
    }

    const session = getAuthSession();

    if (!session.authenticated || !session.activeWorkspace) {
      return HttpResponse.json(
        apiError("WORKSPACE_REQUIRED", "You do not have an active workspace."),
        { status: 404 },
      );
    }

    const updatedSettings = WorkspaceSettingsSchema.parse({
      organizationId: session.activeWorkspace.organizationId,
      ...result.data,
    });

    setAuthSession({
      ...session,
      activeWorkspace: {
        ...session.activeWorkspace,
        name: updatedSettings.name,
        slug: updatedSettings.slug,
        teamSize: updatedSettings.teamSize,
      },
    });

    persistSettings(updatedSettings);

    return HttpResponse.json(updatedSettings);
  },
);
