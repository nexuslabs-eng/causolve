import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { AcceptInvitationResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeInvitation,
  buildFakeOrganization,
  buildFakeUser,
  buildFakeMembership,
} from "../../../test/fixtures.js";

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: sendEmailMock,
}));

const VALID_TOKEN = "a".repeat(64);
const NEW_PASSWORD = "ResolveOS!123";

describe("POST /invitations/accept", () => {
  it("creates the account, joins the organization, and logs them in", async () => {
    const fakeInvitation = {
      ...buildFakeInvitation(),
      organization: buildFakeOrganization(),
    };
    prismaMock.invitation.findUnique.mockResolvedValue(fakeInvitation);
    prismaMock.user.findUnique.mockResolvedValue(null);
    const fakeUser = buildFakeUser({ fullName: "New Hire" });
    prismaMock.user.create.mockResolvedValue(fakeUser);
    const fakeMembership = buildFakeMembership({ role: fakeInvitation.role });
    prismaMock.membership.create.mockResolvedValue(fakeMembership);

    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "New Hire",
      password: NEW_PASSWORD,
    });

    expect(response.status).toBe(201);
    const body = AcceptInvitationResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      accepted: true,
      organizationId: fakeInvitation.organizationId,
      membership: { role: fakeInvitation.role },
    });
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: fakeInvitation.email,
          emailVerified: true,
          authProvider: "PASSWORD",
        }),
      }),
    );
    expect(prismaMock.membership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: fakeInvitation.organizationId,
          role: fakeInvitation.role,
        }),
      }),
    );
    expect(prismaMock.invitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: fakeInvitation.id },
        data: expect.objectContaining({ status: "ACCEPTED" }),
      }),
    );
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("returns 404 when the token matches no invitation", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "New Hire",
      password: NEW_PASSWORD,
    });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_FOUND" },
    });
  });

  it("rejects accepting an invitation that is no longer pending", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(
      buildFakeInvitation({
        status: "ACCEPTED",
        organization: buildFakeOrganization(),
      }),
    );

    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "New Hire",
      password: NEW_PASSWORD,
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_PENDING" },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects accepting an expired-but-still-pending invitation", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(
      buildFakeInvitation({
        expiresAt: new Date(Date.now() - 60 * 1000),
        organization: buildFakeOrganization(),
      }),
    );

    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "New Hire",
      password: NEW_PASSWORD,
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_PENDING" },
    });
  });

  it("rejects when an account already exists for the invited email", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(
      buildFakeInvitation({ organization: buildFakeOrganization() }),
    );
    prismaMock.user.findUnique.mockResolvedValue(buildFakeUser());

    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "New Hire",
      password: NEW_PASSWORD,
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "EMAIL_ALREADY_REGISTERED" },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body", async () => {
    const response = await request(app).post("/invitations/accept").send({
      token: VALID_TOKEN,
      fullName: "",
      password: "weak",
    });

    expect(response.status).toBe(400);
    expect(prismaMock.invitation.findUnique).not.toHaveBeenCalled();
  });
});
