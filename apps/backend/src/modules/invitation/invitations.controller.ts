import crypto from "node:crypto";
import { Request, Response } from "express";
import argon2 from "argon2";
import { prisma } from "@causolve/database";
import {
  type CreateInvitationRequest,
  type CreateInvitationResponse,
  type InvitationListResponse,
  type Invitation,
  type ResendInvitationResponse,
  type InvitationPreview,
  type RevokeInvitationResponse,
  type AcceptInvitationRequest,
  type AcceptInvitationResponse,
  PaginationQuerySchema,
  InvitationTokenRequestSchema,
} from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";
import { logger } from "../../infrastructure/logger.js";
import { welcomeEmailTemplate } from "../../infrastructure/templates/welcomeEmail.template.js";
import { sendEmail } from "../../infrastructure/email.service.js";
import { invitationTemplate } from "../../infrastructure/templates/invitation.template.js";
import { env } from "../../infrastructure/keys.js";
import {
  findInvitationByToken,
  getEffectiveInvitationStatus,
} from "../../infrastructure/invitationToken.js";

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const toInvitationResponse = (invitation: {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  invitedBy: { id: string; fullName: string };
  createdAt: Date;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}): Invitation => ({
  id: invitation.id,
  organizationId: invitation.organizationId,
  email: invitation.email,
  invitedBy: invitation.invitedBy,
  role: invitation.role as Invitation["role"],
  status: getEffectiveInvitationStatus(
    invitation.status,
    invitation.expiresAt,
  ) as Invitation["status"],
  createdAt: invitation.createdAt.toISOString(),
  expiresAt: invitation.expiresAt.toISOString(),
  acceptedAt: invitation.acceptedAt
    ? invitation.acceptedAt.toISOString()
    : null,
  revokedAt: invitation.revokedAt ? invitation.revokedAt.toISOString() : null,
});

export const createInvitation = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string }, unknown, CreateInvitationRequest>,
    res: Response,
  ): Promise<void> => {
    const { organizationId } = req.params;
    const { email, role } = req.body;

    const existingMember = await prisma.membership.findFirst({
      where: { organizationId, user: { email } },
    });
    if (existingMember) {
      sendError(
        res,
        409,
        "ALREADY_A_MEMBER",
        "This email already belongs to a member of this organization.",
      );
      return;
    }
    const existingInvitation = await prisma.invitation.findFirst({
      where: { organizationId, email, status: "PENDING" },
    });
    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      sendError(
        res,
        409,
        "INVITATION_ALREADY_PENDING",
        "An invitation is already pending for this email.",
      );
      return;
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email,
        role,
        tokenHash,
        expiresAt,
        invitedById: req.user!.id,
      },
      include: {
        invitedBy: { select: { id: true, fullName: true } },
      },
    });

    const organization = await prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { name: true },
    });

    const inviteUrl = `${env.CLIENT_URL}/invite?token=${rawToken}`;
    const { subject, text, html } = invitationTemplate(
      req.user!.fullName,
      organization.name,
      inviteUrl,
    );
    await sendEmail({ to: email, subject, text, html });

    const response: CreateInvitationResponse = {
      invitation: toInvitationResponse(invitation),
    };
    sendSuccess(res, 201, response);
  },
);

export const listInvitations = tryCatchWrapper(
  async (req: Request<{ organizationId: string }>, res: Response) => {
    const { organizationId } = req.params;

    const result = PaginationQuerySchema.safeParse(req.query);
    if (!result.success) {
      sendError(res, 400, "INVALID_REQUEST", "Invalid pagination parameters.");
      return;
    }
    const { page, limit } = result.data;

    const [invitations, totalCount] = await Promise.all([
      prisma.invitation.findMany({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          invitedBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.invitation.count({ where: { organizationId } }),
    ]);

    const response: InvitationListResponse = {
      invitations: invitations.map(toInvitationResponse),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    sendSuccess(res, 200, response);
  },
);

export const resendInvitation = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; invitationId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, invitationId } = req.params;

    const existingInvitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId },
      include: {
        invitedBy: { select: { id: true, fullName: true } },
      },
    });
    if (!existingInvitation) {
      sendError(res, 404, "INVITATION_NOT_FOUND", "Invitation not found.");
      return;
    }

    if (existingInvitation.status !== "PENDING") {
      sendError(
        res,
        409,
        "INVITATION_NOT_PENDING",
        `Only a pending invitation can be resent. This invitation is ${existingInvitation.status}`,
      );
      return;
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { tokenHash, expiresAt },
    });
    const organization = await prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { name: true },
    });

    const inviteUrl = `${env.CLIENT_URL}/invite?token=${rawToken}`;
    const { subject, text, html } = invitationTemplate(
      existingInvitation.invitedBy.fullName,
      organization.name,
      inviteUrl,
    );
    await sendEmail({ to: existingInvitation.email, subject, text, html });

    const response: ResendInvitationResponse = {
      invitationId: existingInvitation.id,
      expiresAt: expiresAt.toISOString(),
    };
    sendSuccess(res, 200, response);
  },
);

export const previewInvitation = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const result = InvitationTokenRequestSchema.safeParse(req.query);
    if (!result.success) {
      sendError(
        res,
        400,
        "INVALID_REQUEST",
        "A valid invitation token is required.",
      );
      return;
    }
    const { token } = result.data;

    const invitation = await findInvitationByToken(token);
    if (!invitation) {
      sendError(res, 404, "INVITATION_NOT_FOUND", "Invitation not found.");
      return;
    }
    const status = getEffectiveInvitationStatus(
      invitation.status,
      invitation.expiresAt,
    );

    const response: InvitationPreview = {
      invitationId: invitation.id,
      email: invitation.email,
      organization: invitation.organization,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt.toISOString(),
      status: status as InvitationPreview["status"],
    };
    sendSuccess(res, 200, response);
  },
);

export const revokeInvitation = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; invitationId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, invitationId } = req.params;

    const existingInvitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    if (!existingInvitation) {
      sendError(res, 404, "INVITATION_NOT_FOUND", "Invitation not found.");
      return;
    }

    if (existingInvitation.status !== "PENDING") {
      sendError(
        res,
        409,
        "INVITATION_NOT_PENDING",
        "Only a pending invitation can be revoked.",
      );
      return;
    }

    const revokedAt = new Date();
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "REVOKED", revokedAt },
    });

    const response: RevokeInvitationResponse = {
      invitationId: existingInvitation.id,
      status: "REVOKED",
      revokedAt: revokedAt.toISOString(),
    };
    sendSuccess(res, 200, response);
  },
);

export const acceptInvitation = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, AcceptInvitationRequest>,
    res: Response,
  ): Promise<void> => {
    const { token, fullName, password } = req.body;

    const invitation = await findInvitationByToken(token);
    if (!invitation) {
      sendError(res, 404, "INVITATION_NOT_FOUND", "Invitation not found.");
      return;
    }
    const status = getEffectiveInvitationStatus(
      invitation.status,
      invitation.expiresAt,
    );
    if (status !== "PENDING") {
      sendError(
        res,
        409,
        "INVITATION_NOT_PENDING",
        "This invitation can no longer be accepted",
      );
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });
    if (existingUser) {
      sendError(
        res,
        409,
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists. Log in and ask an admin to add you instead.",
      );
      return;
    }
    const passwordHash = await argon2.hash(password);

    const { user, membership } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email: invitation.email,
          passwordHash,
          authProvider: "PASSWORD",
          emailVerified: true,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });
      return { user, membership };
    });
    req.session.userId = user.id;

    try {
      const { subject, text, html } = welcomeEmailTemplate(
        user.fullName,
        env.CLIENT_URL,
      );
      await sendEmail({ to: user.email, subject, text, html });
    } catch (error) {
      logger.error({ err: error }, "Failed to send welcome email");
    }

    const response: AcceptInvitationResponse = {
      accepted: true,
      organizationId: invitation.organizationId,
      membership: { role: membership.role },
    };
    sendSuccess(res, 201, response);
  },
);
