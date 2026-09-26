import { Router, type Response } from "express";
import { z } from "zod";

import { prisma } from "../../db/prisma";
import { isProduction } from "../../config/auth";
import { requireJsonBody } from "./auth.middleware";
import { emailSchema, hashPassword, newPasswordSchema, sanitizeUser, verifyPassword } from "./credentials";
import { isResetTokenUsable, requestPasswordReset, resetPasswordWithToken } from "./password-reset";
import { passwordPolicyViolations } from "./password-policy";
import { forgotPasswordLimiter, loginLimiter, registerLimiter, resetPasswordLimiter } from "./rate-limit";
import { clearSession, issueSession, resolveSessionUserId } from "./session";
import { oauthRouter } from "./oauth/oauth.router";

export const authRouter = Router();

const registerSchema = z.object({
  email: emailSchema,
  password: newPasswordSchema,
  name: z.string().trim().max(120).optional(),
  rememberMe: z.boolean().optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(1024),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({ email: emailSchema });
const resetTokenSchema = z.string().min(20).max(200);
const resetPasswordSchema = z.object({ token: resetTokenSchema, password: newPasswordSchema });

const INVALID_CREDENTIALS = { error: "Invalid email or password", code: "INVALID_CREDENTIALS" } as const;

/**
 * Sends a 400 WEAK_PASSWORD listing which policy rules failed (rule ids only — the password
 * is never echoed or logged). Returns true when it responded.
 */
function rejectWeakPassword(body: unknown, res: Response) {
  const password = (body as { password?: unknown } | null)?.password;
  if (typeof password !== "string") return false; // missing/wrong type → normal validation error
  const failed = passwordPolicyViolations(password);
  if (failed.length === 0) return false;
  res.status(400).json({ error: "Password does not meet the requirements.", code: "WEAK_PASSWORD", rules: failed });
  return true;
}

authRouter.post("/register", registerLimiter, requireJsonBody, async (req, res, next) => {
  try {
    if (rejectWeakPassword(req.body, res)) return;
    const body = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true } });

    // Never overwrite, merge or silently sign in: the existing owner must use their own login.
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists. Sign in instead or reset your password.",
        code: "EMAIL_EXISTS",
      });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name || null,
        passwordHash: await hashPassword(body.password),
      },
    });

    issueSession(res, user, body.rememberMe ?? false);

    return res.status(201).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    // A concurrent registration for the same email won the unique constraint.
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
      return res.status(409).json({
        error: "An account with this email already exists. Sign in instead or reset your password.",
        code: "EMAIL_EXISTS",
      });
    }
    return next(error);
  }
});

authRouter.post("/login", loginLimiter, requireJsonBody, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });

    // Same response (and roughly the same timing) for unknown emails, wrong passwords and
    // social-only accounts without a password, so anonymous callers learn nothing.
    const isValidPassword = await verifyPassword(body.password, user?.passwordHash);

    if (!user || !isValidPassword) {
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    issueSession(res, user, body.rememberMe ?? false);

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const userId = await resolveSessionUserId(req);
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (!user) {
      return res.status(401).json({
        error: "Unauthenticated",
      });
    }

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  clearSession(res);

  return res.json({
    ok: true,
  });
});

const FORGOT_PASSWORD_RESPONSE = {
  ok: true,
  message: "If an account exists for this email, password reset instructions have been sent.",
} as const;

authRouter.post("/forgot-password", forgotPasswordLimiter, requireJsonBody, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Respond before doing any per-account work, so neither the body nor the timing reveals
    // whether the email belongs to an account. Delivery errors are logged, not surfaced.
    res.json(FORGOT_PASSWORD_RESPONSE);

    requestPasswordReset(email).catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[auth] password reset delivery failed:", isProduction ? (error as Error)?.message : error);
    });
  } catch (error) {
    return next(error);
  }
});

// Lets the reset page tell the user up front that a link is invalid/expired.
authRouter.post("/reset-password/verify", resetPasswordLimiter, requireJsonBody, async (req, res, next) => {
  try {
    const token = resetTokenSchema.safeParse(req.body?.token);
    const valid = token.success && (await isResetTokenUsable(token.data));
    return res.json({ valid });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/reset-password", resetPasswordLimiter, requireJsonBody, async (req, res, next) => {
  try {
    if (rejectWeakPassword(req.body, res)) return;
    const body = resetPasswordSchema.parse(req.body);
    const result = await resetPasswordWithToken(body.token, body.password);

    if (!result.ok) {
      return res.status(400).json(
        result.reason === "expired"
          ? { error: "This reset link has expired. Request a new one.", code: "RESET_TOKEN_EXPIRED" }
          : { error: "This reset link is invalid or has already been used.", code: "RESET_TOKEN_INVALID" }
      );
    }

    // All sessions (including this browser's, if any) were revoked; sign in again.
    clearSession(res);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

authRouter.use(oauthRouter);
