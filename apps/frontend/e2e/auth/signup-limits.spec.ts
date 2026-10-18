import { APIRequestContext, expect, Page, test } from "@playwright/test";
import { extractVerificationOtp, waitForMail } from "../support/mailpit";

const TEST_PASSWORD = "E2eTestPassword123!";
const createUniqueEmail = () => `signup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@resolveos.test`;

async function createAccountAndGetOtp(
    page: Page,
    request: APIRequestContext,
    fullName: string,
) {
    const email = createUniqueEmail();

    await page.goto("/signup/account");
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
        messageId: message.ID,
        otp: extractVerificationOtp(message),
    };
}

test.describe("signup", () => {
    test.describe.configure({ timeout: 200000 });

    test("rejects an expired verification OTP", async ({ page, request }) => {
        const { otp } = await createAccountAndGetOtp(page, request, "Expired OTP User");

        await page.waitForTimeout(32000);

        await page.getByRole("textbox", { name: "6-digit verification code" }).fill(otp);

        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(page.getByText(/expired|request a new code/i)).toBeVisible({ timeout: 45000 });

        await expect(page).toHaveURL(/\/signup\/verify-email$/);
    });

    test("enforces the verification-code resend limit", async ({ page, request }) => {
        const {
            email,
            messageId: initialMessageId,
        } = await createAccountAndGetOtp(page, request, "Resend Rate Limit User");

        let previousMessageId = initialMessageId;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            await page.getByRole("button", { name: "Resend code" }).click();

            await expect(page.getByText("New verification code has been sent.")).toBeVisible({ timeout: 45000 });

            const message = await waitForMail(request, {
                to: email,
                subject: "Your ResolveOS verification code",
                excludeIds: [previousMessageId],
            });

            previousMessageId = message.ID;
        }

        await page.getByRole("button", { name: "Resend code" }).click();

        await expect(
            page
                .getByRole("alert")
                .filter({
                    hasText: "Please wait for a few seconds before requesting another code."
                })
            ).toBeVisible({ timeout: 60000 });
    });
});
