import { Request, Response } from "express";
import { Prisma, prisma } from "@causolve/database";
import {
  WorkspaceSlugSchema,
  type WorkspaceSetupRequest,
  type WorkspaceSetupResponse,
  type WorkspaceSlugAvailabilityResponse,
  type ProfileSetupRequest,
  type ProfileSetupResponse,
  type SignupCompletion,
} from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";
import { sendEmail } from "../../infrastructure/email.service.js";
import { onboardingCompleteTemplate } from "../../infrastructure/templates/onboardingComplete.template.js";
import { logger } from "../../infrastructure/logger.js";
import { env } from "../../infrastructure/keys.js";

export const createWorkspace = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, WorkspaceSetupRequest>,
    res: Response,
  ): Promise<void> => {
    if (!req.user!.emailVerified) {
      sendError(
        res,
        409,
        "ONBOARDING_STEP_NOT_ALLOWED",
        "Verify your email before creating a workspace.",
      );
      return;
    }
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: req.user!.id },
    });
    if (existingMembership) {
      sendError(
        res,
        409,
        "ONBOARDING_STEP_NOT_ALLOWED",
        "A workspace already exists for this account.",
      );
      return;
    }
    const { name, slug } = req.body;

    let organization;
    try {
      organization = await prisma.organization.create({
        data: {
          name,
          slug,
          memberships: { create: { userId: req.user!.id, role: "ADMIN" } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        sendError(
          res,
          409,
          "WORKSPACE_SLUG_UNAVAILABLE",
          "This workspace URL is already in use.",
        );
        return;
      }
      throw error;
    }

    const response: WorkspaceSetupResponse = {
      organizationId: organization.id,
      workspaceName: organization.name,
      workspaceSlug: organization.slug,
      nextStep: "PROFILE",
    };
    sendSuccess(res, 201, response);
  },
);

export const checkWorkspaceSlugAvailability = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const result = WorkspaceSlugSchema.safeParse(req.query.slug);

    if (!result.success) {
      sendError(
        res,
        422,
        "INVALID_WORKSPACE_REQUEST",
        "Enter a valid workspace URL.",
      );
      return;
    }
    const slug = result.data;

    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    let available = !organization;
    if (organization) {
      const ownMembership = await prisma.membership.findFirst({
        where: { userId: req.user!.id, organizationId: organization.id },
      });
      available = ownMembership !== null;
    }

    const response: WorkspaceSlugAvailabilityResponse = { slug, available };
    sendSuccess(res, 200, response);
  },
);

export const completeProfile = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, ProfileSetupRequest>,
    res: Response,
  ): Promise<void> => {
    const membership = await prisma.membership.findFirst({
      where: { userId: req.user!.id },
    });
    if (!membership) {
      sendError(
        res,
        409,
        "ONBOARDING_STEP_NOT_ALLOWED",
        "Create a workspace before completing your profile.",
      );
      return;
    }
    const { jobRole, teamSize, primaryResponsibility } = req.body;
    const onboardingCompletedAt = new Date();

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        jobRole,
        teamSize,
        primaryResponsibility,
        onboardingCompletedAt,
      },
    });

    try {
      const { subject, text, html } = onboardingCompleteTemplate(
        req.user!.fullName,
        env.CLIENT_URL,
      );
      await sendEmail({ to: req.user!.email, subject, text, html });
    } catch (error) {
      logger.error({ err: error }, "Failed to send onboarding-complete email");
    }

    const response: ProfileSetupResponse = {
      completed: true,
      onboardingCompletedAt: onboardingCompletedAt.toISOString(),
      nextStep: "COMPLETE",
    };
    sendSuccess(res, 200, response);
  },
);

export const getSignupCompletion = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const membership = await prisma.membership.findFirst({
      where: { userId: req.user!.id },
      include: {
        organization: true,
        user: {
          select: {
            jobRole: true,
            teamSize: true,
            primaryResponsibility: true,
          },
        },
      },
    });
    if (
      !membership ||
      membership.user.jobRole === null ||
      membership.user.teamSize === null
    ) {
      sendError(
        res,
        409,
        "ONBOARDING_STEP_NOT_ALLOWED",
        "Complete onboarding before viewing its summary.",
      );
      return;
    }
    const response: SignupCompletion = {
      user: {
        id: req.user!.id,
        fullName: req.user!.fullName,
        email: req.user!.email,
      },
      workspace: {
        organizationId: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      },
      profile: {
        jobRole: membership.user.jobRole,
        teamSize: membership.user.teamSize,
        primaryResponsibility:
          membership.user.primaryResponsibility ?? undefined,
      },
      membership: {
        role: membership.role,
      },
    };
    sendSuccess(res, 200, response);
  },
);
