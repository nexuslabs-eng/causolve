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
  MOCK_TEAM_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("PATCH /organizations/:organizationId/teams/:teamId", () => {
  it("renames the team when the user is an admin", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const existingTeam = buildFakeTeam();
    prismaMock.team.findFirst.mockResolvedValue(existingTeam);
    const renamedTeam = buildFakeTeam({ name: "Platform Engineering" });
    prismaMock.team.update.mockResolvedValue(renamedTeam);

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "Platform Engineering" });

    expect(response.status).toBe(200);
    const body = TeamSchema.parse(response.body);
    expect(body).toMatchObject({ name: "Platform Engineering" });
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "Platform Engineering" });

    expect(response.status).toBe(403);
    expect(prismaMock.team.update).not.toHaveBeenCalled();
  });

  it("returns 404 when no team matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.team.findFirst.mockResolvedValue(null);

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "Platform Engineering" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "TEAM_NOT_FOUND" } });
  });

  it("rejects a duplicate team name within the same organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.team.findFirst.mockResolvedValue(buildFakeTeam());
    prismaMock.team.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["organizationId", "name"] },
      }),
    );

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "Already Taken" });

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
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "a" });

    expect(response.status).toBe(400);
    expect(prismaMock.team.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`)
      .send({ name: "Platform Engineering" });

    expect(response.status).toBe(401);
  });
});
