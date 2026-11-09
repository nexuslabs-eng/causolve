import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { InvestigationSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeIncident,
  buildFakeInvestigation,
  MOCK_ORGANIZATION_ID,
  MOCK_INCIDENT_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/incidents/:incidentId/investigation", () => {
  it("returns the investigation for any member, regardless of role", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());
    const fakeInvestigation = buildFakeInvestigation();
    prismaMock.investigation.findUnique.mockResolvedValue(fakeInvestigation);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/investigation`,
    );

    expect(response.status).toBe(200);
    const body = InvestigationSchema.parse(response.body);
    expect(body).toMatchObject({ id: fakeInvestigation.id });
    expect(prismaMock.investigation.findUnique).toHaveBeenCalledWith({
      where: { incidentId: MOCK_INCIDENT_ID },
    });
  });

  it("returns 404 when the incident does not exist in this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.incident.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/investigation`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INCIDENT_NOT_FOUND" },
    });
  });

  it("returns 404 when no investigation has been started for this incident", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());
    prismaMock.investigation.findUnique.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/investigation`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INVESTIGATION_NOT_FOUND" },
    });
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/investigation`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/investigation`,
    );

    expect(response.status).toBe(401);
  });
});
