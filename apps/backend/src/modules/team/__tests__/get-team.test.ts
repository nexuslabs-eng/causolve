import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
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

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/teams/:teamId", () => {
  it("returns the team when it belongs to the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    const fakeTeam = buildFakeTeam();
    prismaMock.team.findFirst.mockResolvedValue(fakeTeam);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`,
    );

    expect(response.status).toBe(200);
    const body = TeamSchema.parse(response.body);
    expect(body).toMatchObject({ id: fakeTeam.id, name: fakeTeam.name });
  });

  it("returns 404 when no team matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.team.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "TEAM_NOT_FOUND" } });
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
    expect(prismaMock.team.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/teams/${MOCK_TEAM_ID}`,
    );

    expect(response.status).toBe(401);
  });
});
