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
  MOCK_USER_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("PATCH /organizations/:organizationId/incidents/:incidentId", () => {
  it("transitions status and stamps acknowledgedAt the first time only", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );
    const existingIncident = buildFakeIncident({ status: "DETECTED" });
    prismaMock.incident.findFirst.mockResolvedValue(existingIncident);
    const updatedIncident = buildFakeIncident({
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
    });
    prismaMock.incident.update.mockResolvedValue(updatedIncident);

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ status: "ACKNOWLEDGED" });

    expect(response.status).toBe(200);
    const body = IncidentSchema.parse(response.body);
    expect(body.status).toBe("ACKNOWLEDGED");
    expect(body.acknowledgedAt).not.toBeNull();
    expect(prismaMock.incidentEvent.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ type: "incident.status_changed" }),
      ],
    });
  });

  it("assigns a commander after validating their membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      // First call: the acting user's own membership check (requireOrganizationMembership).
      .mockResolvedValueOnce(buildFakeMembership({ role: "ENGINEER" }))
      // Second call: validating the proposed commanderId belongs to this organization.
      .mockResolvedValueOnce(buildFakeMembership({ userId: MOCK_USER_ID }));
    const existingIncident = buildFakeIncident({ commanderId: null });
    prismaMock.incident.findFirst.mockResolvedValue(existingIncident);
    prismaMock.incident.update.mockResolvedValue(
      buildFakeIncident({ commanderId: MOCK_USER_ID }),
    );

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ commanderId: MOCK_USER_ID });

    expect(response.status).toBe(200);
    expect(prismaMock.incident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commanderId: MOCK_USER_ID }),
      }),
    );
  });

  it("rejects when the proposed commander has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      .mockResolvedValueOnce(buildFakeMembership({ role: "ENGINEER" }))
      .mockResolvedValueOnce(null);
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ commanderId: MOCK_USER_ID });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "COMMANDER_NOT_FOUND" },
    });
    expect(prismaMock.incident.update).not.toHaveBeenCalled();
  });

  it("rejects when the user's role is below ENGINEER", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ status: "ACKNOWLEDGED" });

    expect(response.status).toBe(403);
    expect(prismaMock.incident.update).not.toHaveBeenCalled();
  });

  it("returns 404 when no incident matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(null);

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ status: "ACKNOWLEDGED" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INCIDENT_NOT_FOUND" },
    });
  });

  it("rejects a malformed request body", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ status: "NOT_A_REAL_STATUS" });

    expect(response.status).toBe(400);
    expect(prismaMock.incident.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .patch(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}`,
      )
      .send({ status: "ACKNOWLEDGED" });

    expect(response.status).toBe(401);
  });
});
