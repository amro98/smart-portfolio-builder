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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}