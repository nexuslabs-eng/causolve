import { expect, test } from "@playwright/test";
import {
  fillResetPassword,
  openResetLink,
  requestPasswordReset,
  RESET_ACCOUNT,
  RESET_PASSWORD,
} from "../support/password-recovery";


test.describe("password recovery", () => {
  test.describe.configure({ timeout: 200000 });

  test("renders the forgot-password form and validates the email", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("heading", { name: "Forgot your password?" })).toBeVisible({
      timeout: 60000,
    });

    const submit = page.getByRole("button", { name: "Send reset link" });
    await page.getByLabel("Email").fill("invalid-email");
    await submit.click();

    await expect(page.getByText("Enter a valid email.")).toBeVisible();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("shows the same confirmation page for an unknown email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(`unknown-${Date.now()}@resolveos.test`);
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page).toHaveURL(/\/check-email$/, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });

  test("resets the password through the real email link", async ({ page, request }) => {
    const { resetUrl } = await requestPasswordReset(page, request);

    await openResetLink(page, resetUrl);

    await fillResetPassword(page, RESET_PASSWORD, "DifferentPassword456!");
    await expect(page.getByText("Passwords do not match.")).toBeVisible();

    await fillResetPassword(page, RESET_PASSWORD);
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page).toHaveURL(/\/password-updated$/, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login$/, { timeout: 60000 });

    await page.getByLabel("Email").fill(RESET_ACCOUNT.email);
    await page.getByRole("textbox", { name: "Password" }).fill(RESET_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/workspace$/, { timeout: 60000 });
  });

  test("does not display the reset form for a malformed token", async ({ page }) => {
    await page.goto(`/reset-password?token=${"short-token"}`);

    await expect(page.getByRole("heading", { name: "Invalid reset link" })).toBeVisible({
      timeout: 60000,
    });
    await expect(page.getByLabel("New password")).toHaveCount(0);
  });

  test("does not allow a consumed reset link to be reused", async ({ page, request }) => {
    const { resetUrl } = await requestPasswordReset(page, request);

    await openResetLink(page, resetUrl);
    await fillResetPassword(page, RESET_PASSWORD);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page).toHaveURL(/\/password-updated$/, { timeout: 60000 });

    await page.goto(resetUrl);
    await expect(page.getByRole("heading", { name: /reset link unavailable|invalid reset link/i })).toBeVisible({
      timeout: 60000,
    });
    await expect(page.getByLabel("New password")).toHaveCount(0);
  });
});
