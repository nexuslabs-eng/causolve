import type { NextFunction, Request, Response } from 'express';
import { prisma } from '@causolve/database';
import { ErrorResponse } from './error.middleware.js';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express's own type augmentation requires namespace syntax; no ES-module equivalent exists.
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.session.userId;

  if (!userId) {
    throw new ErrorResponse('You must be logged in to access this resource.', 401, 'UNAUTHENTICATED');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      emailVerified: true,
    },
  });

  // The account the session points at no longer exists (e.g. deleted after
  // the cookie was issued) — treat this identically to "never logged in"
  // rather than surfacing a 500.
  if (!user) {
    throw new ErrorResponse('You must be logged in to access this resource.', 401, 'UNAUTHENTICATED');
  }

  req.user = user;
  next();
};
