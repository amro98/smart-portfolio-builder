import type { Request, Response } from "express";

import { prisma } from "../../db/prisma";
import { AUTH_COOKIE_NAME, SESSION_CLEAR_OPTIONS, sessionCookieOptions } from "../../constants/cookies";
import { signAuthToken, verifyAuthToken } from "../../utils/jwt";

type SessionUser = { id: string; tokenVersion: number };

/** Sets the session cookie. Cookie lifetime and JWT expiry are derived from the same flag. */
export function issueSession(res: Response, user: SessionUser, remember: boolean) {
  const token = signAuthToken({ userId: user.id, tokenVersion: user.tokenVersion }, remember);
  res.cookie(AUTH_COOKIE_NAME, token, sessionCookieOptions(remember));
}

export function clearSession(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, SESSION_CLEAR_OPTIONS);
}

/**
 * Resolves the session cookie to a live user id, or null. A session is live only while the
 * JWT is valid AND its token version still matches the user's (a password reset bumps it).
 */
export async function resolveSessionUserId(req: Request): Promise<string | null> {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, tokenVersion: true },
  });

  if (!user || user.tokenVersion !== payload.tokenVersion) return null;
  return user.id;
}
