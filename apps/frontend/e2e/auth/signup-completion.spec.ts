import { expect, test } from "@playwright/test";
import {
    completeProfileStep,
    completeWorkspaceStep,
    createVerifiedAccount,
} from "../support/onboarding";

test.describe("signup completion", () => {
    test.describe.configure({ timeout: 200000 });

    test("preserves the completion step after refresh", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);
        await completeWorkspaceStep(page);
        await completeProfileStep(page);

        await expect(
            page.getByRole("heading", { name: "Your workspace is ready" }),
        ).toBeVisible({ timeout: 60000 });

        await page.reload();

        await expect(page).toHaveURL(/\/signup\/complete$/);
        await expect(
            page.getByRole("heading", { name: "Your workspace is ready" }),
        ).toBeVisible({ timeout: 60000 });
    });

    test("enters the workspace after completing onboarding", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);
        await completeWorkspaceStep(page);
        await completeProfileStep(page);

        await page.getByRole("button", { name: "Enter ResolveOS" }).click();

        await expect(page).toHaveURL(/\/workspace$/, {
            timeout: 60000,
        });

        await expect(
            page.getByRole("heading", { name: "Overview" }),
        ).toBeVisible({ timeout: 60000 });
    });
});