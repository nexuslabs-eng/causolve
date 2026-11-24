import { ApiErrorSchema } from "contracts/common/api-error.schema";
import { NotificationPreferencesSchema, type NotificationPreferences } from "contracts/settings/notification-preferences.schema";
import { ProfileSetupRequestSchema, type ProfileSetupRequest } from "contracts/onboarding/profile-setup.schema";
import {
  authSession,
  authenticateMockAccount,
  clearMockSession,
  hasMockAccount,
  getMockPasswordResetToken,
  getMockVerificationCode,
  issuePasswordResetToken,
  issueVerificationCode,
  registerMockAccount,
  resetMockAuthState,
  resetMockPassword,
  setAuthSession,
  updateMockPassword,
  validatePasswordResetToken,
  verifyMockEmailCode,
} from "@/mocks/auth-state";

export {
  authSession,
  authenticateMockAccount,
  clearMockSession,
  hasMockAccount,
  getMockPasswordResetToken,
  getMockVerificationCode,
  issuePasswordResetToken,
  issueVerificationCode,
  registerMockAccount,
  resetMockPassword,
  setAuthSession,
  updateMockPassword,
  validatePasswordResetToken,
  verifyMockEmailCode,
};

export const MOCK_USER_ID = "16161616-1616-4616-8616-161616161616";
export const MOCK_ORGANIZATION_ID = "17171717-1717-4717-8717-171717171717";
export const MOCK_WORKSPACE_NAME = "Acme Engineering";
export const MOCK_WORKSPACE_SLUG = "acme-engineering";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  incidentAlerts: true,
  investigationUpdates: true,
  workspaceInvitations: true,
};

export let notificationPreferences = NotificationPreferencesSchema.parse(
  DEFAULT_NOTIFICATION_PREFERENCES,
);

interface Error {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
    requestId?: string | undefined;
  };
}

type ApiError = (code: string, message: string) => Error;

export const apiError: ApiError = (code, message) =>
  ApiErrorSchema.parse({
    error: { code, message },
  });

export let mockProfile: ProfileSetupRequest | null = null;

export const setMockProfile = (profile: unknown) => {
  mockProfile = ProfileSetupRequestSchema.parse(profile);
};

export const resetMockProfile = () => {
  mockProfile = null;
};

export const resetMockState = () => {
  resetMockAuthState();
  resetMockProfile();
  resetNotificationPreferences();
};

export const setNotificationPreferences = (preferences: unknown) => {
  notificationPreferences = NotificationPreferencesSchema.parse(preferences);
};

export const resetNotificationPreferences = () => {
  setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
};
