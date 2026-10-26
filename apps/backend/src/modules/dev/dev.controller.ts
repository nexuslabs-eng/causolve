import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@causolve/database";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import { sendSuccess, sendError } from "../../infrastructure/responseHandler.js";

// Dev/test-only cleanup tool — never mounted in production (see app.ts).
// Deleting the user cascades away their own Membership rows automatically
// (Membership.user has onDelete: Cascade), but NOT the Organization itself,
// which has no cascade path from User — so any organization this user was
// the sole member of would otherwise be left behind forever. This finds
// those "about to be orphaned" organizations before the delete happens
// (their membership rows won't exist to check afterward), then removes
// them too, once the user itself is gone.
export const deleteUserByEmail = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const result = z.email().safeParse(req.query.email);

    if (!result.success) {
      sendError(res, 400, "INVALID_REQUEST", "Provide a valid email.");
      return;
    }
    const email = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      sendError(res, 404, "USER_NOT_FOUND", "No account found for that email.");
      return;
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    const soleOwnedOrganizationIds: string[] = [];
    for (const membership of memberships) {
      const memberCount = await prisma.membership.count({
        where: { organizationId: membership.organizationId },
      });
      if (memberCount === 1) {
        soleOwnedOrganizationIds.push(membership.organizationId);
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    if (soleOwnedOrganizationIds.length > 0) {
      await prisma.organization.deleteMany({
        where: { id: { in: soleOwnedOrganizationIds } },
      });
    }

    sendSuccess(res, 200, { deleted: true });
  },
);
