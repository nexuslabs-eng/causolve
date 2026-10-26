import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { WorkspaceSlugAvailabilityResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser, buildFakeOrganization } from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /onboarding/workspace-slug-availability", () => {
  it("reports a slug available when no organization has it", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.organization.findUnique.mockResolvedValue(null);

    const response = await agent.get(
      "/onboarding/workspace-slug-availability?slug=acme-engineering",
    );

    expect(response.status).toBe(200);
    const body = WorkspaceSlugAvailabilityResponseSchema.parse(response.body);
    expect(body).toMatchObject({ slug: "acme-engineering", available: true });
  });

  it("reports a slug unavailable when another organization has it", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.organization.findUnique.mockResolvedValue(buildFakeOrganization());
    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      "/onboarding/workspace-slug-availability?slug=acme-engineering",
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ available: false });
  });

  it("reports a slug available when it belongs to the current user's own workspace", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const fakeOrganization = buildFakeOrganization();
    prismaMock.organization.findUnique.mockResolvedValue(fakeOrganization);
    prismaMock.membership.findFirst.mockResolvedValue({
      id: "membership-1",
      userId: fakeUser.id,
      organizationId: fakeOrganization.id,
      role: "ADMIN",
      createdAt: new Date(),
    });

    const response = await agent.get(
      `/onboarding/workspace-slug-availability?slug=${fakeOrganization.slug}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ available: true });
  });

  it("rejects an invalid slug format", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.get(
      "/onboarding/workspace-slug-availability?slug=Not A Valid Slug!",
    );

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: { code: "INVALID_WORKSPACE_REQUEST" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      "/onboarding/workspace-slug-availability?slug=acme-engineering",
    );

    expect(response.status).toBe(401);
  });
});
