import { expect, test, type Page } from "@playwright/test";
import { completedUser } from "../support/seeded-users";

const signInAsCompletedUser = async (page: Page) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible({
    timeout: 60000,
  });
  
  await page.getByLabel("Email").fill(completedUser.email);
  await page.getByRole("textbox", { name: "Password" }).fill(completedUser.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  
  await expect(page).toHaveURL(/\/workspace$/, { timeout: 60000 });
};

const openUserMenu = async (page: Page) => {
  await page.getByRole("button", { name: "Open user menu" }).last().click();
};

test.describe("session and logout", () => {
  test.describe.configure({ timeout: 200000 });

  test("preserves the authenticated session after a page reload", async ({ page }) => {
    await signInAsCompletedUser(page);
    await page.reload();

    await expect(page).toHaveURL(/\/workspace$/, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 60000,
    });
  });

  test("preserves the session in a reopened tab", async ({ page }) => {
    await signInAsCompletedUser(page);

    const reopenedPage = await page.context().newPage();
    try {
      await reopenedPage.goto("/workspace");
      await expect(reopenedPage).toHaveURL(/\/workspace$/, { timeout: 60000 });
      await expect(reopenedPage.getByRole("heading", { name: "Overview" })).toBeVisible({
        timeout: 60000,
      });
    } finally {
      await reopenedPage.close();
    }
  });

  test("cancelling sign out keeps the session active", async ({ page }) => {
    await signInAsCompletedUser(page);
    await openUserMenu(page);
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Sign out of ResolveOS?" })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL(/\/workspace$/, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 45000 });
  });

  test("signs out and prevents access to the workspace", async ({ page }) => {
    await signInAsCompletedUser(page);
    await openUserMenu(page);
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 60000 });

    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login$/, { timeout: 60000 });
  });
});
