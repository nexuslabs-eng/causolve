import { APIRequestContext, expect, Page, test } from "@playwright/test";
import { extractVerificationOtp, waitForMail } from "../support/mailpit";

const TEST_PASSWORD = "E2eTestPassword123!";
const createUniqueEmail = () => `signup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@resolveos.test`;

async function createAccountAndGetOtp({
    page,
    request,
    fullName,
}: {
    page: Page;
    request: APIRequestContext;
    fullName: string;
}) {
    const email = createUniqueEmail();

    await page.goto("/signup/account");

    await expect(
        page.getByRole("heading", { name: "Create your ResolveOS account" }),
    ).toBeVisible({ timeout: 60000 });

    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Full name").fill(fullName);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/signup\/verify-email$/, { timeout: 60000 });

    const message = await waitForMail(request, {
        to: email,
        subject: "Your ResolveOS verification code",
    });

    return {
        email,
        otp: extractVerificationOtp(message),
    };
}

test.describe("signup", () => {
    test.describe.configure({ timeout: 200000 });
    
    test("creates an account and verifies the email through Mailpit",
        async ({ page, request }) => {
            const { otp } = await createAccountAndGetOtp({
                page,
                request,
                fullName: "Signup E2E User"
            });

            await page.getByRole("textbox", { name: "6-digit verification code" }).fill(otp);

            await page.getByRole("button", { name: "Verify email" }).click();

            await expect(page).toHaveURL(/\/signup\/workspace$/, { timeout: 60000 });
        }
    );

    test("rejects a duplicate email", async ({ page }) => {
        await page.goto("/signup/account");

        await page.getByLabel("Work email").fill("e2e.completed@resolveos.test");
        await page.getByLabel("Full name").fill("Duplicate E2E User");
        await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
        await page.getByLabel("Confirm password").fill(TEST_PASSWORD);

        await page.getByRole("button", { name: "Continue" }).click();

        await expect(
            page.getByText("An account already exists for this email.")
        ).toBeVisible({ timeout: 60000 });

        await expect(page).toHaveURL(/\/signup\/account$/);
    });

    test("rejects an invalid verification code", async ({ page, request }) => {
        await createAccountAndGetOtp({
            page,
            request,
            fullName: "Invalid OTP E2E User",
        });

        await page.getByRole("textbox", { name: "6-digit verification code" }).fill("000000");

        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(page.getByText("The verification code is invalid.")).toBeVisible({ timeout: 45000 });

        await expect(page).toHaveURL(/\/signup\/verify-email$/);
    });
});
