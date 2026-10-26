import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { Prisma } from "@causolve/database";
import { WorkspaceSetupResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser, buildFakeOrganization, buildFakeMembership } from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /onboarding/workspace", () => {
  it("creates the organization and an ADMIN membership", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: true });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);
    const fakeOrganization = buildFakeOrganization();
    prismaMock.organization.create.mockResolvedValue(fakeOrganization);

    const response = await agent.post("/onboarding/workspace").send({
      name: fakeOrganization.name,
      slug: fakeOrganization.slug,
    });

    expect(response.status).toBe(201);
    const body = WorkspaceSetupResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      organizationId: fakeOrganization.id,
      workspaceName: fakeOrganization.name,
      workspaceSlug: fakeOrganization.slug,
      nextStep: "PROFILE",
    });
  });

  it("rejects when the email isn't verified yet", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: false });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/onboarding/workspace").send({
      name: "Acme Engineering",
      slug: "acme-engineering",
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "ONBOARDING_STEP_NOT_ALLOWED" },
    });
    expect(prismaMock.organization.create).not.toHaveBeenCalled();
  });

  it("rejects when the user already has a workspace", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: true });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());

    const response = await agent.post("/onboarding/workspace").send({
      name: "Acme Engineering",
      slug: "acme-engineering",
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "ONBOARDING_STEP_NOT_ALLOWED" },
    });
    expect(prismaMock.organization.create).not.toHaveBeenCalled();
  });

  it("rejects a slug that's already taken", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: true });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);
    prismaMock.organization.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["slug"] },
      }),
    );

    const response = await agent.post("/onboarding/workspace").send({
      name: "Acme Engineering",
      slug: "acme-engineering",
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "WORKSPACE_SLUG_UNAVAILABLE" },
    });
  });

  it("rejects a malformed request body before touching the database", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: true });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/onboarding/workspace").send({
      name: "",
      slug: "Not A Valid Slug!",
    });

    expect(response.status).toBe(400);
    expect(prismaMock.membership.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post("/onboarding/workspace").send({
      name: "Acme Engineering",
      slug: "acme-engineering",
    });

    expect(response.status).toBe(401);
  });
});
