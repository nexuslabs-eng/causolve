import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { CreateInvitationResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeInvitation,
  buildFakeOrganization,
  MOCK_ORGANIZATION_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: sendEmailMock,
}));

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /organizations/:organizationId/invitations", () => {
  it("creates and emails an invitation when the user is an admin", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      .mockResolvedValueOnce(buildFakeMembership({ role: "ADMIN" }))
      .mockResolvedValueOnce(null);
    prismaMock.invitation.findFirst.mockResolvedValue(null);
    const fakeInvitation = buildFakeInvitation();
    prismaMock.invitation.create.mockResolvedValue(fakeInvitation);
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(
      buildFakeOrganization(),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: fakeInvitation.email, role: fakeInvitation.role });

    expect(response.status).toBe(201);
    const body = CreateInvitationResponseSchema.parse(response.body);
    expect(body.invitation).toMatchObject({
      id: fakeInvitation.id,
      email: fakeInvitation.email,
      status: "PENDING",
    });
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("rejects when the email already belongs to a member of this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      .mockResolvedValueOnce(buildFakeMembership({ role: "ADMIN" }))
      .mockResolvedValueOnce(buildFakeMembership());

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "existing@acme.com", role: "ENGINEER" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: { code: "ALREADY_A_MEMBER" } });
    expect(prismaMock.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects when a live pending invitation already exists for this email", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      .mockResolvedValueOnce(buildFakeMembership({ role: "ADMIN" }))
      .mockResolvedValueOnce(null);
    prismaMock.invitation.findFirst.mockResolvedValue(
      buildFakeInvitation({
        expiresAt: new Date(Date.now() + 60 * 1000),
      }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "newhire@acme.com", role: "ENGINEER" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_ALREADY_PENDING" },
    });
    expect(prismaMock.invitation.create).not.toHaveBeenCalled();
  });

  it("allows re-inviting when the existing pending row has already expired", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst
      .mockResolvedValueOnce(buildFakeMembership({ role: "ADMIN" }))
      .mockResolvedValueOnce(null);
    prismaMock.invitation.findFirst.mockResolvedValue(
      buildFakeInvitation({
        expiresAt: new Date(Date.now() - 60 * 1000),
      }),
    );
    const fakeInvitation = buildFakeInvitation();
    prismaMock.invitation.create.mockResolvedValue(fakeInvitation);
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(
      buildFakeOrganization(),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: fakeInvitation.email, role: fakeInvitation.role });

    expect(response.status).toBe(201);
    expect(prismaMock.invitation.create).toHaveBeenCalled();
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "newhire@acme.com", role: "ENGINEER" });

    expect(response.status).toBe(403);
    expect(prismaMock.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "newhire@acme.com", role: "ENGINEER" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects a malformed request body", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "not-an-email", role: "ENGINEER" });

    expect(response.status).toBe(400);
    expect(prismaMock.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/invitations`)
      .send({ email: "newhire@acme.com", role: "ENGINEER" });

    expect(response.status).toBe(401);
  });
});
