import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { healthRouter } from "./modules/health/health.router";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./modules/auth/auth.router";
import { portfoliosRouter } from "./modules/portfolios/portfolios.router";
import { publicRouter } from "./modules/public/public.router";
import { uploadsRouter } from "./modules/uploads/uploads.router";
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from "./config/uploads";

// CORS_ORIGIN may be a single origin or a comma-separated list (e.g. a deployed
// frontend plus a local dev origin during a migration window).
function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? "http://localhost:5173";

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const allowedOrigins = parseAllowedOrigins();

  // Render/Railway-style deployments sit behind a reverse proxy that terminates TLS;
  // trusting it lets req.protocol/req.secure (and therefore secure cookies and the
  // absolute URLs returned by the uploads route) reflect the real https origin.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/", (_req, res) => res.json({ name: "SPB API", version: "v1" }));

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/portfolios", portfoliosRouter);
  app.use("/public", publicRouter);

  // Uploaded images must be embeddable from the frontend's origin (a different domain
  // in production), so relax helmet's default same-origin Cross-Origin-Resource-Policy
  // for this route only. Auth is intentionally NOT required to read a file — public
  // portfolio visitors need to load these images too.
  app.use(
    UPLOADS_URL_PREFIX,
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(UPLOADS_DIR)
  );
  app.use(UPLOADS_URL_PREFIX, uploadsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}