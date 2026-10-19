import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./infrastructure/keys.js";
import { createSessionMiddleware } from "./infrastructure/session.js";
import { httpLogger } from "./middleware/httpLogger.middleware.js";
import {
  appErrorHandler,
  notFoundRoutes,
} from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rateLimit.middleware.js";

import authRouter from "./modules/auth/auth.routes.js";
import onboardingRouter from "./modules/onboarding/onboarding.routes.js";
import teamsRouter from "./modules/team/teams.routes.js";
import servicesRouter from "./modules/service/services.routes.js";
import invitationsRouter from "./modules/invitation/invitations.routes.js";
import devRouter from "./modules/dev/dev.routes.js";

const app = express();

// Render sits exactly one reverse-proxy hop in front of the app, so this makes req.ip/req.ips (used by httpLogger.middleware.ts) and req.secure resolve correctly instead of reporting Render's proxy as the client.

app.set("trust proxy", 1);
app.disable("x-powered-by");
// Every response here reflects session/tenant-scoped state (who's logged in, what org they belong to, live list data) — none of it is ever safe for the browser to serve from cache on a repeat GET. Express's default
// ETag generation was causing exactly that: /auth/session returning a cached 304 (empty body) on repeat checks instead of the real auth state.
app.disable("etag");

const cleanClientUrl = env.CLIENT_URL.replace(/\/$/, "");
const allowedOrigins = [cleanClientUrl, env.CLIENT_URL];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Idempotency-Key", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range", "x-request-id"],
};

// Order matters below.
app.use(cors(corsOptions));
app.use(httpLogger);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(createSessionMiddleware());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// Placed after /health (not before) so health checks stay exempt from the
// rate limit — same reasoning as httpLogger.middleware.ts ignoring /health.
app.use(globalLimiter);

app.use("/auth", authRouter);
app.use("/onboarding", onboardingRouter);
app.use(teamsRouter);
app.use(servicesRouter);
app.use(invitationsRouter);

// Dev/test-only cleanup tooling — never reachable once deployed.
if (env.NODE_ENV !== "production") {
  app.use("/dev", devRouter);
}

app.use(notFoundRoutes);
app.use(appErrorHandler);

export default app;
