import type { Request, Response, NextFunction } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { env } from '../infrastructure/keys.js';
import { sendError } from '../infrastructure/responseHandler.js';

const noopMiddleware = (_req: Request, _res: Response, next: NextFunction): void => next();

const ipAndUserAgentKey = (req: Request): string =>
  `${ipKeyGenerator(req.ip ?? 'unknown-ip')}-${req.headers['user-agent'] || 'unknown-user-agent'}`;

// Every rate-limit rejection responds through sendError, same as any other
// error in this app — so a 429 comes back shaped like ApiErrorSchema
// instead of being the one endpoint that returns a bare string.
const makeRateLimitedHandler = (errorCode: string) => (_req: Request, res: Response): void => {
  sendError(res, 429, errorCode, 'Too many requests, please try again later.');
};

const rateLimitedHandler = makeRateLimitedHandler('RATE_LIMITED');

export const globalLimiter =
  rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        limit: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        handler: rateLimitedHandler,
        keyGenerator: ipAndUserAgentKey,
      });

export const customRateLimiter = (
  maxRequests: number,
  windowMinutes: number = 3,
  keyBySession: boolean = false,
  errorCode: string = 'RATE_LIMITED',
) => {

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeRateLimitedHandler(errorCode),
    keyGenerator: (req) => {
      if (keyBySession && req.session.userId) {
        return `user-${req.session.userId}`;
      }
      return ipAndUserAgentKey(req);
    },
  });
};
