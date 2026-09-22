export const AUTH_COOKIE_NAME = "spb_session";

const isProduction = process.env.NODE_ENV === "production";

// In production the frontend and backend are typically deployed on different origins
// (e.g. Vercel + Render), so the session cookie must be sent cross-site. That requires
// SameSite=None, which in turn requires Secure. Locally (http://localhost) neither of
// those work, so dev keeps the classic same-site Lax/non-secure cookie.
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};