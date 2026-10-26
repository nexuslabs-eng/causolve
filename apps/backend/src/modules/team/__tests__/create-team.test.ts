import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { Prisma } from "@causolve/database";
import { TeamSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeTeam,
  MOCK_ORGANIZATION_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /organizations/:organizationId/teams", () => {
  it("creates a team when the user is an admin of the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const fakeTeam = buildFakeTeam();
    prismaMock.team.create.mockResolvedValue(fakeTeam);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: fakeTeam.name });

    expect(response.status).toBe(201);
    const body = TeamSchema.parse(response.body);
    expect(body).toMatchObject({ id: fakeTeam.id, name: fakeTeam.name });
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: "Platform Team" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: "Platform Team" });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ error: { code: "FORBIDDEN" } });
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate team name within the same organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.team.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["organizationId", "name"] },
      }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: "Platform Team" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: { code: "TEAM_NAME_TAKEN" } });
  });

  it("rejects a malformed request body", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: "a" });

    expect(response.status).toBe(400);
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/teams`)
      .send({ name: "Platform Team" });

    expect(response.status).toBe(401);
  });
});
