import type { CookieOptions } from "express";

import { DEFAULT_SESSION_TTL_MS, REMEMBERED_SESSION_TTL_MS, isProduction } from "../config/auth";

export const AUTH_COOKIE_NAME = "spb_session";
/** Short-lived OAuth round-trip state (state + PKCE verifier). Scoped to the OAuth routes. */
export const OAUTH_STATE_COOKIE_NAME = "spb_oauth";
/** Signed, short-lived "a new social sign-up is waiting for confirmation" marker. */
export const SOCIAL_PENDING_COOKIE_NAME = "spb_social_pending";

export const OAUTH_COOKIE_PATH = "/auth/oauth";
export const SOCIAL_PENDING_COOKIE_PATH = "/auth/social";

// In production the frontend and backend are typically deployed on different origins
// (e.g. Vercel + Render), so the session cookie must be sent cross-site. That requires
// SameSite=None, which in turn requires Secure. Locally (http://localhost) neither of
// those work, so dev keeps the classic same-site Lax/non-secure cookie.
const CROSS_SITE_BASE: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

/**
 * Session cookie options. With "remember me" the cookie persists as long as the JWT inside it
 * (30 days); without it, it's a browser-session cookie (no Max-Age) whose JWT expires in 12h.
 */
export function sessionCookieOptions(remember: boolean): CookieOptions {
  return remember ? { ...CROSS_SITE_BASE, maxAge: REMEMBERED_SESSION_TTL_MS } : { ...CROSS_SITE_BASE };
}

/** Options for clearing the session cookie: same scope attributes, and no Max-Age (Express 4
 *  would otherwise use it to set a future expiry instead of expiring the cookie). */
export const SESSION_CLEAR_OPTIONS: CookieOptions = { ...CROSS_SITE_BASE };

/**
 * The OAuth state cookie is set on a top-level navigation to this API and read back on the
 * provider's top-level redirect to our callback, so SameSite=Lax is sufficient (and safer).
 */
export const OAUTH_STATE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: OAUTH_COOKIE_PATH,
};

/** Read by the SPA via credentialed fetches, so it needs the same cross-site attributes as the session. */
export const SOCIAL_PENDING_COOKIE_OPTIONS: CookieOptions = {
  ...CROSS_SITE_BASE,
  path: SOCIAL_PENDING_COOKIE_PATH,
};

export { DEFAULT_SESSION_TTL_MS, REMEMBERED_SESSION_TTL_MS };
