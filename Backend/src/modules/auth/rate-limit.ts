import rateLimit, { type Options } from "express-rate-limit";

import { isProduction } from "../../config/auth";

const WINDOW_MS = 15 * 60 * 1000;
// Development keeps the limiter active (so it can be exercised) but far more generous.
const DEV_MULTIPLIER = isProduction ? 1 : 10;

function limiter(limit: number, extra: Partial<Options> = {}) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: limit * DEV_MULTIPLIER,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please wait a few minutes and try again.", code: "RATE_LIMITED" },
    ...extra,
  });
}

/** Failed sign-ins only — a user who logs in successfully isn't penalised. */
export const loginLimiter = limiter(10, { skipSuccessfulRequests: true });
export const registerLimiter = limiter(10);
export const forgotPasswordLimiter = limiter(5);
export const resetPasswordLimiter = limiter(10);
export const oauthLimiter = limiter(30);
