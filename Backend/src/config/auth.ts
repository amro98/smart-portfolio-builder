// Central auth configuration. Everything here comes from env; nothing secret has a default.

export const isProduction = process.env.NODE_ENV === "production";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** Where the SPA lives. OAuth callbacks only ever redirect here (never to a caller-supplied URL). */
export function getFrontendUrl() {
  const explicit = process.env.FRONTEND_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);
  const firstCorsOrigin = (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",")[0]?.trim();
  return trimTrailingSlash(firstCorsOrigin || "http://localhost:5173");
}

/** Public base URL of this API — used to build the exact OAuth callback URLs registered with providers. */
export function getApiPublicUrl() {
  return trimTrailingSlash(process.env.API_PUBLIC_URL?.trim() || `http://localhost:${process.env.PORT ?? 4000}`);
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** "Remember me" sessions: persistent cookie + JWT, both 30 days. */
export const REMEMBERED_SESSION_TTL_MS = 30 * DAY;
/** Default sessions: browser-session cookie; the JWT inside hard-expires after 12 hours. */
export const DEFAULT_SESSION_TTL_MS = 12 * HOUR;

/** OAuth round-trip (state + PKCE verifier) and the pending social sign-up both expire quickly. */
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const SOCIAL_PENDING_TTL_MS = 10 * 60 * 1000;

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
