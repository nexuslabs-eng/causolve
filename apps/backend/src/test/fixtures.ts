import type {
  Invitation,
  Membership,
  Organization,
  Service,
  Team,
  User,
} from "@resolve-os/database";

export const MOCK_USER_ID = "99999999-9999-4999-8999-999999999999";
export const MOCK_ORGANIZATION_ID = "88888888-8888-4888-8888-888888888888";
export const MOCK_MEMBERSHIP_ID = "77777777-7777-4777-8777-777777777777";
export const MOCK_TEAM_ID = "66666666-6666-4666-8666-666666666666";
export const MOCK_SERVICE_ID = "55555555-5555-4555-8555-555555555555";
export const MOCK_INVITATION_ID = "44444444-4444-4444-8444-444444444444";

export const buildFakeUser = (overrides: Partial<User> = {}): User => ({
  id: MOCK_USER_ID,
  fullName: "John Doe",
  email: "johndoe@example.com",
  passwordHash: "hashed-password",
  authProvider: "PASSWORD",
  emailVerified: false,
  jobRole: null,
  teamSize: null,
  primaryResponsibility: null,
  onboardingCompletedAt: null,
  verificationCode: "hashed-otp",
  verificationAttempts: 0,
  verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
  passwordResetTokenHash: null,
  passwordResetTokenExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const buildFakeOrganization = (
  overrides: Partial<Organization> = {},
): Organization => ({
  id: MOCK_ORGANIZATION_ID,
  name: "Acme Engineering",
  slug: "acme-engineering",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const buildFakeMembership = (
  overrides: Partial<Membership> = {},
): Membership => ({
  id: MOCK_MEMBERSHIP_ID,
  userId: MOCK_USER_ID,
  organizationId: MOCK_ORGANIZATION_ID,
  role: "ADMIN",
  createdAt: new Date(),
  ...overrides,
});

export const buildFakeTeam = (overrides: Partial<Team> = {}): Team => ({
  id: MOCK_TEAM_ID,
  organizationId: MOCK_ORGANIZATION_ID,
  name: "Platform Team",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const buildFakeService = (
  overrides: Partial<Service> = {},
): Service => ({
  id: MOCK_SERVICE_ID,
  organizationId: MOCK_ORGANIZATION_ID,
  teamId: null,
  name: "Checkout API",
  environment: "production",
  healthStatus: "UNKNOWN",
  currentVersion: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Every endpoint that returns an Invitation does so with `invitedBy`
// included, so the fixture carries it too even though it's not part of
// Prisma's own Invitation scalar type. `organization` is only present on
// the token-lookup path (findInvitationByToken), hence optional here.
type FakeInvitation = Invitation & {
  invitedBy: { id: string; fullName: string };
  organization?: { id: string; name: string; slug: string };
};

export const buildFakeInvitation = (
  overrides: Partial<FakeInvitation> = {},
): FakeInvitation => ({
  id: MOCK_INVITATION_ID,
  organizationId: MOCK_ORGANIZATION_ID,
  email: "newhire@acme.com",
  role: "ENGINEER",
  status: "PENDING",
  tokenHash: "irrelevant-because-prisma-is-mocked",
  invitedById: MOCK_USER_ID,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  acceptedAt: null,
  revokedAt: null,
  invitedBy: { id: MOCK_USER_ID, fullName: "John Doe" },
  ...overrides,
});
