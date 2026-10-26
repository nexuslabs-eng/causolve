import type { NextFunction, Request, Response } from "express";
import { prisma, type Role } from "@causolve/database";
import { ErrorResponse } from "./error.middleware.js";

export interface RequestMembership {
  organizationId: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express's own type augmentation requires namespace syntax; no ES-module equivalent exists.
  namespace Express {
    interface Request {
      membership?: RequestMembership;
    }
  }
}

export const requireOrganizationMembership = async (
  req: Request<{ organizationId: string }>,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const { organizationId } = req.params;

  const membership = await prisma.membership.findFirst({
    where: { userId: req.user!.id, organizationId },
    select: { role: true },
  });

  if (!membership) {
    throw new ErrorResponse(
      "Organization not found",
      404,
      "ORGANIZATION_NOT_FOUND",
    );
  }
  req.membership = { organizationId, role: membership.role };
  next();
};
