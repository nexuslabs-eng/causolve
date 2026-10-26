import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { AuthSessionSchema, LogoutResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeOrganization,
  buildFakeMembership,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /auth/session", () => {
  it("reports anonymous when there is no session", async () => {
    const response = await request(app).get("/auth/session");

    expect(response.status).toBe(200);
    const body = AuthSessionSchema.parse(response.body);
    expect(body).toMatchObject({ authenticated: false });
  });

  it("reports the current user when a session is active", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.get("/auth/session");

    expect(response.status).toBe(200);
    const body = AuthSessionSchema.parse(response.body);
    expect(body).toMatchObject({
      authenticated: true,
      user: { id: fakeUser.id, email: fakeUser.email },
    });
  });

  it("reports the real workspace, membership, and completion time once onboarding is fully done", async () => {
    const completedAt = new Date();
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: true,
      jobRole: "SOFTWARE_ENGINEER",
      teamSize: "SIX_TO_TWENTY",
      onboardingCompletedAt: completedAt,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const fakeOrganization = buildFakeOrganization();
    const fakeMembership = buildFakeMembership();
    const userWithMembership = {
      ...fakeUser,
      memberships: [{ role: fakeMembership.role, organization: fakeOrganization }],
    };
    prismaMock.user.findUnique.mockResolvedValue(userWithMembership);

    const response = await agent.get("/auth/session");

    expect(response.status).toBe(200);
    const body = AuthSessionSchema.parse(response.body);
    expect(body).toMatchObject({
      authenticated: true,
      activeWorkspace: {
        organizationId: fakeOrganization.id,
        name: fakeOrganization.name,
        slug: fakeOrganization.slug,
      },
      membership: { role: fakeMembership.role },
      onboarding: {
        status: "COMPLETED",
        nextStep: "COMPLETE",
        completedAt: completedAt.toISOString(),
      },
    });
  });

  it("treats a session pointing at a deleted account as anonymous", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    // The account behind this session no longer exists by the time the
    // follow-up request comes in (e.g. deleted after the cookie was issued).
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await agent.get("/auth/session");

    expect(response.status).toBe(200);
    const body = AuthSessionSchema.parse(response.body);
    expect(body).toMatchObject({ authenticated: false });
  });
});

describe("POST /auth/logout", () => {
  it("destroys the session so a follow-up request is anonymous again", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const logoutResponse = await agent.post("/auth/logout");

    expect(logoutResponse.status).toBe(200);
    const body = LogoutResponseSchema.parse(logoutResponse.body);
    expect(body).toMatchObject({ loggedOut: true });

    const sessionResponse = await agent.get("/auth/session");
    expect(sessionResponse.body).toMatchObject({ authenticated: false });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post("/auth/logout");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "UNAUTHENTICATED" } });
  });
});
