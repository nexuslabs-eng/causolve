import { expect, test } from "@playwright/test";
import {
    completeWorkspaceStep,
    createVerifiedAccount,
} from "../support/onboarding";

test.describe("signup profile", () => {
    test.describe.configure({ timeout: 200000 });

    test("preserves the profile step after refresh", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);
        await completeWorkspaceStep(page);

        await expect(
            page.getByRole("heading", { name: "Tell us about your work" }),
        ).toBeVisible();

        await page.reload();

        await expect(page).toHaveURL(/\/signup\/profile$/);
        await expect(
            page.getByRole("heading", { name: "Tell us about your work" }),
        ).toBeVisible();
    });
});