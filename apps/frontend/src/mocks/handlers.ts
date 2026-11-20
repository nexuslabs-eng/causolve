import { AuthSessionSchema } from "contracts";
import { http, HttpResponse } from "msw";
import { getAuthSession } from "@/mocks/auth-state";
import { login } from "@/mocks/endpoints/login";
import { signupAccount } from "@/mocks/endpoints/signup-account";
import { verifyEmail } from "@/mocks/endpoints/verify-email";
import { workspaceSetup } from "@/mocks/endpoints/workspace-setup";
import { profileSetup } from "@/mocks/endpoints/profile-setup";
import {
  forgotPassword,
  validateResetToken,
  resetPassword,
} from "@/mocks/endpoints/password-reset";
import { resendVerificationOtp } from "@/mocks/endpoints/verification-otp";
import { signupCompletion } from "@/mocks/endpoints/signup-completion";
import { logout } from "@/mocks/endpoints/logout";
import { incident } from "@/mocks/endpoints/command-center";
import { workspaceSlugAvailability } from "@/mocks/endpoints/workspace-slug-availability";
import { apiEndpoint } from "@/lib/api/api-config";
import { profileUpdate } from "@/mocks/endpoints/profile-update";
import { changePassword } from "@/mocks/endpoints/change-password";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/mocks/endpoints/notification-preferences";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/mocks/endpoints/user-preferences";

export const handlers = [
  http.get(apiEndpoint("/auth/session"), () =>
    HttpResponse.json(AuthSessionSchema.parse(getAuthSession())),
  ),
  login,
  logout,
  profileUpdate,
  signupAccount,
  verifyEmail,
  workspaceSetup,
  workspaceSlugAvailability,
  profileSetup,
  signupCompletion,
  forgotPassword,
  validateResetToken,
  resetPassword,
  resendVerificationOtp,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getUserPreferences,
  updateUserPreferences,
  incident,
];
