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

    test("continues after refreshing the verification page", async ({ page, request }) => {
        const { otp } = await createAccountAndGetOtp(page, request, "Refresh Verification User");

        await page.reload();

        await expect(
            page.getByRole("heading", { name: "Verify your email" })
        ).toBeVisible({ timeout: 60000 });

        await page.getByRole("textbox", { name: "6-digit verification code" }).fill(otp);

        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(page).toHaveURL(/\/signup\/workspace$/, { timeout: 60000 });
    });

    test("invalidates the previous OTP after resending", async ({ page, request }) => {
        const {
            email,
            messageId: originalMessageId,
            otp: originalOtp,
        } = await createAccountAndGetOtp(page, request, "Resend Verification User");

        const otpInput = page.getByRole("textbox", {
            name: "6-digit verification code",
        });

        await page.getByRole("button", { name: "Resend code" }).click();

        await expect(
            page.getByText("New verification code has been sent.")
        ).toBeVisible({ timeout: 45000 });

        const resentMessage = await waitForMail(request, {
            to: email,
            subject: "Your ResolveOS verification code",
            excludeIds: [originalMessageId],
        });

        const resentOtp = extractVerificationOtp(resentMessage);

        await otpInput.fill(originalOtp);

        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(
            page.getByText("The verification code is invalid.")
        ).toBeVisible({ timeout: 60000 });

        await otpInput.fill("");
        await otpInput.fill(resentOtp);

        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(page).toHaveURL(/\/signup\/workspace$/, { timeout: 60000 });
    });
});
