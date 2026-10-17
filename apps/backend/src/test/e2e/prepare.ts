import * as argon2 from "argon2";
import { prisma } from "@resolve-os/database";

const TEST_PASSWORD = "E2eTestPassword123!";



const completedUserData = {
    authProvider: "PASSWORD" as const,
    emailVerified: true,
    jobRole: "SOFTWARE_ENGINEER" as const,
    teamSize: "SIX_TO_TWENTY" as const,
    primaryResponsibility: "APPLICATION_ENGINEERING" as const,
    onboardingCompletedAt: new Date(),
};

const createUser = async (
    email: string,
    fullName: string,
    passwordHash: string,
    emailVerified = false
) => prisma.user.create({
    data: {
        email,
        fullName,
        passwordHash,
        authProvider: "PASSWORD",
        emailVerified
    },
});

const createCompletedUser = async (
    email: string,
    fullName: string,
    passwordHash: string,
    workspaceName: string,
    workspaceSlug: string,
) => {
    const user = await prisma.user.create({
        data: {
            email,
            fullName,
            passwordHash,
            ...completedUserData,
        },
    });

    await prisma.organization.create({
        data: {
            name: workspaceName,
            slug: workspaceSlug,
            memberships: {
                create: { userId: user.id, role: "ADMIN" },
            },
        },
    });

    return user;
};

const prepare = async (): Promise<void> => {
    await prisma.session.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await argon2.hash(TEST_PASSWORD);

    await createCompletedUser(
        "e2e.completed@resolveos.test",
        "Completed E2E User",
        passwordHash,
        "E2E Completed Workspace",
        "e2e-completed-workspace",
    );

    await createUser(
        "e2e.unverified@resolveos.test",
        "Unverified E2E User",
        passwordHash,
    );

    await createUser(
        "e2e.onboarding@resolveos.test",
        "Workspace Pending E2E User",
        passwordHash,
        true,
    );

    const profilePendingUser = await createUser(
        "e2e.profile@resolveos.test",
        "Profile Pending E2E User",
        passwordHash,
        true,
    );

    await prisma.organization.create({
        data: {
            name: "E2E Profile Workspace",
            slug: "e2e-profile-workspace",
            memberships: {
                create: {
                    userId: profilePendingUser.id,
                    role: "ADMIN",
                },
            },
        },
    });

    await createCompletedUser(
        "e2e.password-reset@resolveos.test",
        "Password Reset E2E User",
        passwordHash,
        "E2E Password Reset Workspace",
        "e2e-password-reset-workspace",
    );

    await prisma.organization.create({
        data: {
            name: "E2E Reserved Workspace",
            slug: "e2e-reserved-slug",
        },
    });
};

try {
    await prepare();
} finally {
    await prisma.$disconnect();
}