import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { clearMailpit, extractPasswordResetUrl, waitForMail } from "./mailpit";

export const RESET_ACCOUNT = {
  email: "e2e.password-reset@resolveos.test",
  password: "E2eTestPassword123!",
} as const;

export const RESET_PASSWORD = "NewE2eTestPassword456!";

export const requestPasswordReset = async (
  page: Page,
  request: APIRequestContext,
  email = RESET_ACCOUNT.email,
) => {
  await clearMailpit(request);
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: "Forgot your password?" })).toBeVisible({
    timeout: 60000,
  });

  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page).toHaveURL(/\/check-email$/, { timeout: 60000 });

  const message = await waitForMail(request, {
    to: email,
    subject: "Reset your ResolveOS password",
    timeoutMs: 60000,
  });

  return {
    email,
    message,
    resetUrl: extractPasswordResetUrl(message),
  };
};

export const openResetLink = async (page: Page, resetUrl: string) => {
  await page.goto(resetUrl);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible({
    timeout: 60000,
  });
};

export const fillResetPassword = async (
  page: Page,
  password: string,
  confirmPassword = password,
) => {
  await page.getByLabel("New password").fill(password);
  await page.getByLabel("Confirm password").fill(confirmPassword);
};
