import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { ResendInvitationResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeInvitation,
  buildFakeOrganization,
  MOCK_ORGANIZATION_ID,
  MOCK_INVITATION_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: sendEmailMock,
}));

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /organizations/:organizationId/invitations/:invitationId/resend", () => {
  it("rotates the token and re-sends the email for a pending invitation", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const fakeInvitation = buildFakeInvitation();
    prismaMock.invitation.findFirst.mockResolvedValue(fakeInvitation);
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(
      buildFakeOrganization(),
    );

    const response = await agent.post(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations/${MOCK_INVITATION_ID}/resend`,
    );

    expect(response.status).toBe(200);
    const body = ResendInvitationResponseSchema.parse(response.body);
    expect(body).toMatchObject({ invitationId: fakeInvitation.id });
    expect(prismaMock.invitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MOCK_INVITATION_ID },
        data: expect.objectContaining({
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }),
    );
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("returns 404 when no invitation matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.invitation.findFirst.mockResolvedValue(null);

    const response = await agent.post(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations/${MOCK_INVITATION_ID}/resend`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_FOUND" },
    });
  });

  it("rejects resending an invitation that is no longer pending", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.invitation.findFirst.mockResolvedValue(
      buildFakeInvitation({ status: "ACCEPTED" }),
    );

    const response = await agent.post(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations/${MOCK_INVITATION_ID}/resend`,
    );

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_PENDING" },
    });
    expect(prismaMock.invitation.update).not.toHaveBeenCalled();
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent.post(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations/${MOCK_INVITATION_ID}/resend`,
    );

    expect(response.status).toBe(403);
    expect(prismaMock.invitation.update).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations/${MOCK_INVITATION_ID}/resend`,
    );

    expect(response.status).toBe(401);
  });
});
