import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { SignupCompletionSchema } from "contracts";
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

describe("GET /onboarding/completion", () => {
  it("returns the full summary once onboarding is complete", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const fakeOrganization = buildFakeOrganization();
    const fakeMembership = buildFakeMembership();
    const membershipWithRelations = {
      ...fakeMembership,
      organization: fakeOrganization,
      user: {
        jobRole: "SOFTWARE_ENGINEER",
        teamSize: "SIX_TO_TWENTY",
        primaryResponsibility: "APPLICATION_ENGINEERING",
      },
    };
    prismaMock.membership.findFirst.mockResolvedValue(membershipWithRelations);

    const response = await agent.get("/onboarding/completion");

    expect(response.status).toBe(200);
    const body = SignupCompletionSchema.parse(response.body);
    expect(body).toMatchObject({
      user: { id: fakeUser.id, email: fakeUser.email },
      workspace: { organizationId: fakeOrganization.id, slug: fakeOrganization.slug },
      profile: { jobRole: "SOFTWARE_ENGINEER", teamSize: "SIX_TO_TWENTY" },
      membership: { role: "ADMIN" },
    });
  });

  it("rejects when no workspace has been created yet", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get("/onboarding/completion");

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "ONBOARDING_STEP_NOT_ALLOWED" },
    });
  });

  it("rejects when the profile hasn't been completed yet", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const membershipWithIncompleteProfile = {
      ...buildFakeMembership(),
      organization: buildFakeOrganization(),
      user: { jobRole: null, teamSize: null, primaryResponsibility: null },
    };
    prismaMock.membership.findFirst.mockResolvedValue(membershipWithIncompleteProfile);

    const response = await agent.get("/onboarding/completion");

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "ONBOARDING_STEP_NOT_ALLOWED" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get("/onboarding/completion");

    expect(response.status).toBe(401);
  });
});
