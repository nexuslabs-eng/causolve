import {
  DEFAULT_SERVER_USER_PREFERENCES,
  ServerUserPreferencesSchema,
  UpdateUserPreferencesRequestSchema,
  type UpdateUserPreferencesRequest,
} from "contracts/settings/user-preferences.schema";
import { http, HttpResponse } from "msw";
import { apiEndpoint } from "@/lib/api/api-config";
import { apiError, authSession } from "@/mocks/utils";

const STORAGE_KEY = "causolve_mock_user_preferences";

const getStoredPreferences = () => {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!stored) return DEFAULT_SERVER_USER_PREFERENCES;

    const result = UpdateUserPreferencesRequestSchema.safeParse(
      JSON.parse(stored),
    );

    return result.success ? result.data : DEFAULT_SERVER_USER_PREFERENCES;
  } catch {
    return DEFAULT_SERVER_USER_PREFERENCES;
  }
};

const setStoredPreferences = (preferences: UpdateUserPreferencesRequest) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

const requireAuthentication = () => {
  if (authSession.authenticated) return null;

  return HttpResponse.json(
    apiError("UNAUTHENTICATED", "You must be signed in."),
    { status: 401 },
  );
};

export const getUserPreferences = http.get(
  apiEndpoint("/settings/preferences"),
  () => {
    const authenticationError = requireAuthentication();

    if (authenticationError) return authenticationError;

    return HttpResponse.json(
      ServerUserPreferencesSchema.parse(getStoredPreferences()),
    );
  },
);

export const updateUserPreferences = http.patch(
  apiEndpoint("/settings/preferences"),
  async ({ request }) => {
    const authenticationError = requireAuthentication();

    if (authenticationError) return authenticationError;

    const result = UpdateUserPreferencesRequestSchema.safeParse(
      await request.json(),
    );

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_USER_PREFERENCES", "Invalid user preferences."),
        { status: 422 },
      );
    }

    setStoredPreferences(result.data);

    return HttpResponse.json(ServerUserPreferencesSchema.parse(result.data));
  },
);
