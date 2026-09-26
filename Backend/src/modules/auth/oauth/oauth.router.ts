import { timingSafeEqual } from "node:crypto";
import { Router, type Response } from "express";

import { prisma } from "../../../db/prisma";
import { OAUTH_STATE_TTL_MS, SOCIAL_PENDING_TTL_MS, getFrontendUrl } from "../../../config/auth";
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_COOKIE_OPTIONS,
  SOCIAL_PENDING_COOKIE_NAME,
  SOCIAL_PENDING_COOKIE_OPTIONS,
} from "../../../constants/cookies";
import { signTypedToken, verifyTypedToken } from "../../../utils/jwt";
import { requireJsonBody } from "../auth.middleware";
import { normalizeEmail, sanitizeUser } from "../credentials";
import { oauthLimiter } from "../rate-limit";
import { issueSession } from "../session";
import { loadArctic } from "./arctic";
import { getProvider, listProviders } from "./providers";
import { decideSocialOutcome } from "./social-decision";
import { OAuthExchangeError } from "./types";

export const oauthRouter = Router();

type Intent = "login" | "register";

type OAuthStatePayload = {
  provider: string;
  state: string;
  codeVerifier: string | null;
  remember: boolean;
  intent: Intent;
};

type SocialPendingPayload = {
  /** "signup": create a new account. "link": attach this identity to an existing account. */
  mode?: "signup" | "link";
  /** The existing account to link to (link mode only). */
  userId?: string | null;
  provider: string;
  providerAccountId: string;
  /** Normalized, provider-verified email. */
  email: string;
  emailVerified?: boolean;
  name: string | null;
  remember: boolean;
};

/** Error codes the SPA knows how to explain (see auth error translations). */
type OAuthErrorCode =
  | "provider_unavailable"
  | "oauth_cancelled"
  | "oauth_state_invalid"
  | "oauth_failed"
  | "oauth_email_missing";

// Redirect targets are always built from FRONTEND_URL + fixed paths — never from request
// input — so the callback can't be turned into an open redirect.
function redirectWithError(res: Response, intent: Intent, code: OAuthErrorCode, provider?: string) {
  const url = new URL(`${getFrontendUrl()}${intent === "register" ? "/register" : "/login"}`);
  url.searchParams.set("authError", code);
  if (provider) url.searchParams.set("provider", provider);
  return res.redirect(303, url.toString());
}

function providerParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function clearOAuthState(res: Response) {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, OAUTH_STATE_COOKIE_OPTIONS);
}

function clearPending(res: Response) {
  res.clearCookie(SOCIAL_PENDING_COOKIE_NAME, SOCIAL_PENDING_COOKIE_OPTIONS);
}

oauthRouter.get("/providers", (_req, res) => {
  res.json({ providers: listProviders() });
});

// Step 1: the SPA navigates the browser here (top-level), we set a signed state cookie and
// bounce to the provider.
oauthRouter.get("/oauth/:provider", oauthLimiter, async (req, res, next) => {
  const intent: Intent = req.query.intent === "register" ? "register" : "login";
  try {
    const providerId = providerParam(req.params.provider);
    const provider = getProvider(providerId);
    if (!provider || !provider.isConfigured()) {
      return redirectWithError(res, intent, "provider_unavailable", providerId);
    }

    const { generateState, generateCodeVerifier } = await loadArctic();
    const state = generateState();
    const codeVerifier = provider.usesPkce ? generateCodeVerifier() : null;
    const payload: OAuthStatePayload = {
      provider: provider.id,
      state,
      codeVerifier,
      remember: req.query.remember === "1",
      intent,
    };

    res.cookie(OAUTH_STATE_COOKIE_NAME, signTypedToken("oauth_state", payload, OAUTH_STATE_TTL_MS), {
      ...OAUTH_STATE_COOKIE_OPTIONS,
      maxAge: OAUTH_STATE_TTL_MS,
    });
    return res.redirect(303, (await provider.createAuthorizationURL(state, codeVerifier)).toString());
  } catch (error) {
    return next(error);
  }
});

// Step 2: the provider redirects back here with ?code&state (or ?error when the user declined).
oauthRouter.get("/oauth/:provider/callback", oauthLimiter, async (req, res, next) => {
  const saved = verifyTypedToken<OAuthStatePayload>("oauth_state", req.cookies?.[OAUTH_STATE_COOKIE_NAME]);
  // The state cookie is single-use whatever happens next.
  clearOAuthState(res);
  const intent: Intent = saved?.intent ?? "login";
  const providerId = providerParam(req.params.provider);

  try {
    const provider = getProvider(providerId);
    if (!provider || !provider.isConfigured()) return redirectWithError(res, intent, "provider_unavailable", providerId);

    if (typeof req.query.error === "string") {
      return redirectWithError(res, intent, "oauth_cancelled", provider.id);
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!saved || saved.provider !== provider.id || !code || !state || !safeEqual(state, saved.state)) {
      return redirectWithError(res, intent, "oauth_state_invalid", provider.id);
    }

    let profile;
    try {
      profile = await provider.fetchProfile(code, saved.codeVerifier);
    } catch (error) {
      if (error instanceof OAuthExchangeError) {
        // eslint-disable-next-line no-console
        console.warn(`[oauth] ${provider.id} exchange failed: ${error.message}`);
        return redirectWithError(res, intent, "oauth_failed", provider.id);
      }
      throw error;
    }

    const [account, existingUser] = await Promise.all([
      prisma.authAccount.findUnique({
        where: { provider_providerAccountId: { provider: provider.id, providerAccountId: profile.providerAccountId } },
        include: { user: { select: { id: true, tokenVersion: true } } },
      }),
      profile.email ? prisma.user.findUnique({ where: { email: profile.email }, select: { id: true } }) : null,
    ]);

    const decision = decideSocialOutcome({
      linkedUserId: account?.user.id ?? null,
      verifiedEmail: profile.email,
      existingUserId: existingUser?.id ?? null,
    });

    if (decision.kind === "login") {
      // decision "login" implies the identity is linked, so `account` is set.
      if (account) issueSession(res, account.user, saved.remember);
      return res.redirect(303, `${getFrontendUrl()}/auth/social/complete`);
    }
    if (decision.kind === "email_missing") {
      return redirectWithError(res, intent, "oauth_email_missing", provider.id);
    }

    // Nothing is created or linked yet. Hand the SPA a short-lived, signed pending marker and
    // let the user explicitly confirm — either creating a new account, or linking this
    // identity to the existing account that owns the same verified email.
    const pending: SocialPendingPayload = {
      mode: decision.kind,
      userId: decision.kind === "link" ? decision.userId : null,
      provider: provider.id,
      providerAccountId: profile.providerAccountId,
      email: decision.email,
      emailVerified: true,
      name: profile.name,
      remember: saved.remember,
    };
    res.cookie(SOCIAL_PENDING_COOKIE_NAME, signTypedToken("social_pending", pending, SOCIAL_PENDING_TTL_MS), {
      ...SOCIAL_PENDING_COOKIE_OPTIONS,
      maxAge: SOCIAL_PENDING_TTL_MS,
    });
    return res.redirect(303, `${getFrontendUrl()}/auth/social/confirm`);
  } catch (error) {
    return next(error);
  }
});

function readPending(cookies: Record<string, string> | undefined) {
  const pending = verifyTypedToken<SocialPendingPayload & { exp: number }>("social_pending", cookies?.[SOCIAL_PENDING_COOKIE_NAME]);
  // Markers from before link support carry no mode; they were always sign-ups. A marker is
  // only ever issued for a provider-verified email; anything else is treated as invalid.
  if (!pending || pending.emailVerified === false) return null;
  return { ...pending, mode: pending.mode ?? "signup", userId: pending.userId ?? null };
}

const PENDING_EXPIRED = { error: "This request has expired. Please start again.", code: "SOCIAL_PENDING_EXPIRED" } as const;

// What the confirmation screen displays. Only identity details — never provider tokens.
oauthRouter.get("/social/pending", (req, res) => {
  const pending = readPending(req.cookies);
  if (!pending) {
    clearPending(res);
    return res.status(410).json(PENDING_EXPIRED);
  }
  const provider = getProvider(pending.provider);
  return res.json({
    pending: {
      mode: pending.mode,
      provider: pending.provider,
      providerLabel: provider?.label ?? pending.provider,
      email: pending.email,
      name: pending.name,
      expiresAt: new Date(pending.exp * 1000).toISOString(),
    },
  });
});

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

oauthRouter.post("/social/confirm", oauthLimiter, requireJsonBody, async (req, res, next) => {
  const pending = readPending(req.cookies);
  // Single-use whatever the outcome.
  clearPending(res);
  if (!pending) {
    return res.status(410).json(PENDING_EXPIRED);
  }

  try {
    // Re-check at confirmation time: the situation may have changed since the callback.
    const linked = await prisma.authAccount.findUnique({
      where: { provider_providerAccountId: { provider: pending.provider, providerAccountId: pending.providerAccountId } },
      include: { user: true },
    });

    if (pending.mode === "link") {
      if (linked) {
        // Already attached (e.g. a double submit): only fine if it's the same account.
        if (linked.userId !== pending.userId) {
          return res.status(409).json({ error: "This sign-in is already linked to a different account.", code: "SOCIAL_LINK_CONFLICT" });
        }
        issueSession(res, linked.user, pending.remember);
        return res.json({ user: sanitizeUser(linked.user), created: false, linked: true });
      }

      // The account must still exist and still own exactly the verified email we matched on.
      const user = pending.userId ? await prisma.user.findUnique({ where: { id: pending.userId } }) : null;
      if (!user || normalizeEmail(user.email) !== pending.email) {
        return res.status(409).json({ error: "The account changed. Please start again.", code: "SOCIAL_LINK_STALE" });
      }

      try {
        await prisma.authAccount.create({
          data: { userId: user.id, provider: pending.provider, providerAccountId: pending.providerAccountId, providerEmail: pending.email },
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        // Lost a race with a concurrent confirm; accept it only if it linked the same account.
        const winner = await prisma.authAccount.findUnique({
          where: { provider_providerAccountId: { provider: pending.provider, providerAccountId: pending.providerAccountId } },
        });
        if (winner?.userId !== user.id) {
          return res.status(409).json({ error: "This sign-in is already linked to a different account.", code: "SOCIAL_LINK_CONFLICT" });
        }
      }

      issueSession(res, user, pending.remember);
      return res.json({ user: sanitizeUser(user), created: false, linked: true });
    }

    if (linked) {
      issueSession(res, linked.user, pending.remember);
      return res.json({ user: sanitizeUser(linked.user), created: false });
    }

    // Someone registered this email between the callback and now: don't create a duplicate.
    // Signing in with the provider again will offer to link it instead.
    const emailTaken = await prisma.user.findUnique({ where: { email: pending.email }, select: { id: true } });
    if (emailTaken) {
      return res.status(409).json({ error: "An account with this email already exists.", code: "SOCIAL_EMAIL_EXISTS" });
    }

    const user = await prisma.user.create({
      data: {
        email: pending.email,
        name: pending.name,
        passwordHash: null,
        authAccounts: {
          create: { provider: pending.provider, providerAccountId: pending.providerAccountId, providerEmail: pending.email },
        },
      },
    });

    issueSession(res, user, pending.remember);
    return res.status(201).json({ user: sanitizeUser(user), created: true });
  } catch (error) {
    // Lost a race with another sign-up for the same email or identity.
    if (isUniqueViolation(error)) {
      return res.status(409).json({ error: "An account with this email already exists.", code: "SOCIAL_EMAIL_EXISTS" });
    }
    return next(error);
  }
});

oauthRouter.post("/social/cancel", requireJsonBody, (_req, res) => {
  clearPending(res);
  res.json({ ok: true });
});
