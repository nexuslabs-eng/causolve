import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { IncidentSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeIncident,
  MOCK_ORGANIZATION_ID,
  MOCK_INCIDENT_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/incidents/:incidentId", () => {
  it("returns the incident for any member, regardless of role", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );
    const fakeIncident = buildFakeIncident();
    prismaMock.incident.findFirst.mockResolvedValue(fakeIncident);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
    );

    expect(response.status).toBe(200);
    const body = IncidentSchema.parse(response.body);
    expect(body).toMatchObject({ id: fakeIncident.id });
    expect(prismaMock.incident.findFirst).toHaveBeenCalledWith({
      where: { id: MOCK_INCIDENT_ID, organizationId: MOCK_ORGANIZATION_ID },
    });
  });

  it("returns 404 when no incident matches within this organization (tenant isolation)", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    // Simulates an incident that exists but belongs to a different organization —
    // the compound where-clause makes findFirst return null rather than leaking it.
    prismaMock.incident.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INCIDENT_NOT_FOUND" },
    });
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
    );

    expect(response.status).toBe(401);
  });
});
