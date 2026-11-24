import type { NextFunction, Request, Response } from "express";
import { ZodError, type z } from "zod";
import { logError } from "../infrastructure/logger.js";
import { sendError } from "../infrastructure/responseHandler.js";

// Express 5 made req.query a read-only getter (a breaking change from
// Express 4, where it was a plain writable property) — middleware can no
// longer do `req.query = parsedData`. The validated/coerced query result
// lives here instead; controllers read from req.validatedQuery, not
// req.query, once this middleware has run.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express's own type augmentation requires namespace syntax; no ES-module equivalent exists.
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

// Validate request body
export const validateFormData =
  (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync(req.body);
      req.body = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.map(String),
        }));

        return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", { issues });
      }
      next(error);
    }
  };

// Validate request query parameters
export const validateQueryParams =
  (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.query);

      if (!result.success) {
        const issues = result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.map(String),
        }));

        return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", { issues });
      }

      req.validatedQuery = result.data as Record<string, unknown>;
      return next();
    } catch (error) {
      logError(error, "Unhandled exception in query validation middleware");
      return next(error);
    }
  };
