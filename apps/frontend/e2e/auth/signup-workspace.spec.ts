import { expect, test } from "@playwright/test";
import { createVerifiedAccount } from "../support/onboarding";

test.describe("signup workspace", () => {
    test.describe.configure({ timeout: 200000 });

    test("rejects an unavailable workspace slug", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);

        await page.getByLabel("Workspace name").fill("Reserved Workspace");
        await page.getByLabel("Workspace URL").fill("e2e-reserved-slug");

        await expect(
            page.getByText("This workspace URL is already in use."),
        ).toBeVisible({ timeout: 60000 });

        await expect(
            page.getByRole("button", { name: "Continue" }),
        ).toBeDisabled();

        await expect(page).toHaveURL(/\/signup\/workspace$/);
    });

    test("rejects a workspace URL ending with a hyphen", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);

        await page.getByLabel("Workspace name").fill("Invalid Slug Workspace");
        await page.getByLabel("Workspace URL").fill("invalid-slug-");

        await expect(
            page.getByRole("button", { name: "Continue" }),
        ).toBeDisabled();

        await expect(
            page.getByText(
                "Workspace URL may contain lowercase letters, numbers and hyphens.",
            ),
        ).toBeVisible();
    });

    test("allows returning from workspace setup to the account step", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);

        await page.getByRole("button", { name: "Back" }).click();

        await expect(page).toHaveURL(/\/signup\/account$/);
        await expect(
            page.getByRole("heading", {
                name: "Create your ResolveOS account",
            }),
        ).toBeVisible({ timeout: 60000 });
    });

    test("preserves the workspace step after refresh", async ({
        page,
        request,
    }) => {
        await createVerifiedAccount(page, request);

        await expect(
            page.getByRole("heading", { name: "Create your workspace" }),
        ).toBeVisible({ timeout: 45000 });

        await page.reload();

        await expect(page).toHaveURL(/\/signup\/workspace$/);
        await expect(
            page.getByRole("heading", { name: "Create your workspace" }),
        ).toBeVisible({ timeout: 45000 });
    });
});