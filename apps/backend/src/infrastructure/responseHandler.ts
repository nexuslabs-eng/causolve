import type { Response } from 'express';
import type { ApiError } from 'contracts/common/api-error.schema';
import { logger } from './logger.js';

const sendResponse = (res: Response, status: number, body: unknown): void => {
  res.status(status).json(body);
};

export const sendSuccess = <T>(res: Response, status: number, data: T): void => {
  sendResponse(res, status, data);
};

// Shape matches the ApiError contract exactly (packages/contracts) so it
// never drifts per-endpoint. requestId is pulled from the request itself
// (set by httpLogger.middleware.ts) so call sites don't have to thread it
// through manually.
export const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): void => {
  
  const requestId = res.req.id as string;

  logger.error({ code, message, requestId }, 'Error response sent');

  const body: ApiError = {
    error: {
      code,
      message,
      requestId,
      ...(details !== undefined && { details }),
    },
  };

  sendResponse(res, status, body);
};
