export const onboardingRoutes = {
  VERIFY_EMAIL: "/signup/verify-email",
  CREATE_WORKSPACE: "/signup/workspace",
  PROFILE: "/signup/profile",
  COMPLETE: "/signup/complete",
} as const;

export const recoveryRoutes: Set<string> = new Set([
  "/forgot-password",
  "/reset-password",
  "/password-updated",
  "/check-email",
]);
