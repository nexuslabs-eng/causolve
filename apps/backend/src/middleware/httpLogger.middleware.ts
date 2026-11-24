import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { pinoHttp } from "pino-http";
import { env } from "../infrastructure/keys.js";
import { logger } from "../infrastructure/logger.js";

const isProduction = env.NODE_ENV === "production";

export const httpLogger = pinoHttp<Request, Response>({
  logger,
  genReqId: (req, res) => {
    const existingId = req.headers["x-request-id"];
    const id = typeof existingId === "string" && existingId.length > 0 ? existingId : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  // Skip health-check noise in production; keep full logging in dev.
  autoLogging: isProduction ? { ignore: (req) => req.url === "/health" } : true,
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        "user-agent": req.headers["user-agent"],
        host: req.headers.host,
      },
      // The raw socket peer — always the immediate hop (e.g. a platform's
      // own reverse proxy), not useful for identifying the actual visitor
      // behind any reverse proxy.
      remoteAddress: req.socket?.remoteAddress,
      // Express's own trust-proxy-resolved client IP — what a rate limiter's
      // keyGenerator would actually use. Only meaningful once `trust proxy`
      // is configured on the Express app to match the real hop count.
      ip: req.ip,
      // The FULL, unprocessed chain, left-to-right from original client to
      // most recent proxy — raw evidence for verifying trust proxy's hop
      // count instead of guessing. req.ips is Express's own parsed version
      // of this same header, included as a cross-check.
      forwardedFor: req.headers["x-forwarded-for"],
      ips: req.ips,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
  },
});
