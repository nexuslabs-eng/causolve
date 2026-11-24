import type { AuthSession } from "contracts/auth/auth-session.schema";

export const authenticatedSettingsSession: AuthSession = {
  authenticated: true,
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Samuel Oso",
    email: "samuel@example.com",
    emailVerified: true,
  },
  activeWorkspace: {
    organizationId: "22222222-2222-4222-8222-222222222222",
    name: "Causolve",
    slug: "causolve",
    teamSize: "SIX_TO_TWENTY",
  },
  membership: {
    role: "ADMIN",
    jobRole: "FRONTEND_ENGINEER",
  },
  onboarding: {
    status: "COMPLETED",
    nextStep: "COMPLETE",
    emailVerified: true,
    workspaceCreated: true,
    profileCompleted: true,
    completedAt: "2026-11-18T00:00:00.000Z",
  },
};
