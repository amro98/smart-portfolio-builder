import "dotenv/config";
import { createApp } from "./app";
import { prisma } from "./db/prisma";
import { logMailDeliveryMode } from "./services/mailer";

const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

function assertRequiredEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[api] Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy Backend/.env.example to Backend/.env and fill them in."
    );
    process.exit(1);
  }
}

assertRequiredEnvVars();

// Not fatal (email/password auth works without them), but OAuth callbacks and reset-email
// links would otherwise point at localhost defaults.
if (process.env.NODE_ENV === "production") {
  const missing = ["FRONTEND_URL", "API_PUBLIC_URL"].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[api] Auth configuration incomplete: ${missing.join(", ")} not set. See Backend/.env.example.`);
  }
}

logMailDeliveryMode();

const app = createApp();

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on port ${port} (${process.env.NODE_ENV ?? "development"})`);
});

function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`[api] received ${signal}, shutting down...`);

  server.close(() => {
    prisma
      .$disconnect()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  });

  // Force-exit if connections don't close in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));