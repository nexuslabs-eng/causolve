import { expect, test, type Page } from "@playwright/test";
import { completedUser, onboardingUser, unverifiedUser } from "../support/seeded-users";

const signIn = async (page: Page, email: string, password: string) => {
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
};

test.describe("login", () => {
  test.describe.configure({ timeout: 200000 });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible({
      timeout: 45000,
    });
  });

  test("renders the login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("prevents submission when the form is invalid", async ({ page }) => {
    const submit = page.getByRole("button", { name: "Sign in" });

    await expect(submit).toBeDisabled();
    await page.getByLabel("Email").fill("invalid-email");

    await expect(page.getByText("Enter a valid email.")).toBeVisible();
    await expect(submit).toBeDisabled();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await signIn(page, `missing-${Date.now()}@example.com`, "WrongPassword123!");

    await expect(page.getByRole("alert")).toHaveText("Invalid email or password.", { timeout: 20000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test("routes a completed user to the workspace", async ({ page }) => {
    await signIn(page, completedUser.email, completedUser.password);

    await expect(page).toHaveURL(/\/workspace$/, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 60000 });
  });

  test("routes an unverified user to email verification", async ({ page }) => {
    await signIn(page, unverifiedUser.email, unverifiedUser.password);

    await expect(page).toHaveURL(/\/signup\/verify-email$/, { timeout: 60000 });
  });

  test("routes an incomplete user to the server-provided onboarding step", async ({ page }) => {
    await signIn(page, onboardingUser.email, onboardingUser.password);

    await expect(page).toHaveURL(/\/signup\/(workspace|profile|complete)$/, { timeout: 60000 });
  });
});
