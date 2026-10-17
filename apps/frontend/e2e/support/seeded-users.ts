export const E2E_TEST_PASSWORD = "E2eTestPassword123!";

export const completedUser = {
    email: "e2e.completed@resolveos.test",
    password: E2E_TEST_PASSWORD,
} as const;

export const unverifiedUser = {
    email: "e2e.unverified@resolveos.test",
    password: E2E_TEST_PASSWORD,
} as const;

export const onboardingUser = {
    email: "e2e.onboarding@resolveos.test",
    password: E2E_TEST_PASSWORD,
} as const;