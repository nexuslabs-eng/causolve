import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { extractVerificationOtp, waitForMail } from "./mailpit";

const TEST_PASSWORD = "E2eTestPassword123!";

const createUniqueEmail = () =>
    `onboarding-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@resolveos.test`;

export const createVerifiedAccount = async (
    page: Page,
    request: APIRequestContext,
) => {
    const email = createUniqueEmail();

    await page.goto("/signup/account");

    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Full name").fill("Onboarding E2E User");
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/signup\/verify-email$/, {
        timeout: 80000,
    });

    const verificationEmail = await waitForMail(request, {
        to: email,
        subject: "Your ResolveOS verification code",
    });

    await page
        .getByRole("textbox", { name: "6-digit verification code" })
        .fill(extractVerificationOtp(verificationEmail));

    await page.getByRole("button", { name: "Verify email" }).click();

    await expect(page).toHaveURL(/\/signup\/workspace$/, {
        timeout: 80000,
    });
};

export const completeWorkspaceStep = async (page: Page) => {
    const workspaceName = `E2E Workspace ${Date.now()}`;
    const workspaceSlug = `e2e-workspace-${Date.now()}`;

    await page.getByLabel("Workspace name").fill(workspaceName);
    await page.getByLabel("Workspace URL").fill(workspaceSlug);

    await expect(
        page.getByRole("status").filter({
            hasText: "Workspace URL is available.",
        }),
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/signup\/profile$/, {
        timeout: 60000,
    });

    return workspaceName;
};

export const completeProfileStep = async (page: Page) => {
    const selects = page.getByRole("combobox");

    await selects.nth(0).click();
    await page.getByRole("option", { name: "Software Engineer" }).click();

    await selects.nth(1).click();
    await page.getByRole("option", { name: "6-20 people" }).click();

    await selects.nth(2).click();
    await page
        .getByRole("option", { name: "Application engineering" })
        .click();

    await page.getByRole("button", { name: "Complete setup" }).click();

    await expect(page).toHaveURL(/\/signup\/complete$/, {
        timeout: 60000,
    });
};