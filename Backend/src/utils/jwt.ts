import jwt from "jsonwebtoken";

import { DEFAULT_SESSION_TTL_MS, REMEMBERED_SESSION_TTL_MS } from "../config/auth";

export type AuthTokenPayload = {
  userId: string;
  /** User.tokenVersion at issue time; absent on tokens issued before it existed (treated as 0). */
  tokenVersion: number;
};

// Every token we sign carries a `typ`, so a short-lived OAuth/pending token can never be
// replayed as a session (or vice versa).
type TokenType = "session" | "oauth_state" | "social_pending";

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
}

export function signAuthToken(payload: AuthTokenPayload, remember: boolean) {
  const ttlMs = remember ? REMEMBERED_SESSION_TTL_MS : DEFAULT_SESSION_TTL_MS;
  return jwt.sign({ userId: payload.userId, tv: payload.tokenVersion, typ: "session" }, getSecret(), {
    expiresIn: Math.floor(ttlMs / 1000),
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
  const { userId, tv, typ } = decoded as { userId?: unknown; tv?: unknown; typ?: unknown };
  // Tokens from before `typ` existed are sessions; anything typed must be a session.
  if (typ !== undefined && typ !== "session") throw new Error("Invalid token type");
  if (typeof userId !== "string") throw new Error("Invalid token");
  return { userId, tokenVersion: typeof tv === "number" ? tv : 0 };
}

/** Signs a short-lived, tamper-proof payload of the given type. */
export function signTypedToken<T extends object>(typ: Exclude<TokenType, "session">, payload: T, ttlMs: number) {
  return jwt.sign({ ...payload, typ }, getSecret(), { expiresIn: Math.floor(ttlMs / 1000) });
}

/** Verifies signature, expiry and type; returns null for anything invalid. */
export function verifyTypedToken<T extends object>(typ: Exclude<TokenType, "session">, token: string | undefined): T | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded !== "object" || decoded === null || (decoded as { typ?: unknown }).typ !== typ) return null;
    return decoded as T;
  } catch {
    return null;
  }
}
