// Run with `npm test`. Covers the pure, security-relevant pieces of auth; the HTTP flows
// (register/login/reset/OAuth) are exercised end to end against a running API instead.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET ??= "test-secret-for-unit-tests-only";

import { emailSchema, newPasswordSchema, normalizeEmail, verifyPassword, hashPassword } from "./credentials";
import { pickGitHubEmail } from "./oauth/github";
import { profileFromGoogleClaims } from "./oauth/google";
import { OAuthExchangeError } from "./oauth/types";
import { passwordPolicyViolations } from "./password-policy";
import { decideSocialOutcome } from "./oauth/social-decision";
import { readSmtpConfig } from "../../services/mailer";
import { signAuthToken, signTypedToken, verifyAuthToken, verifyTypedToken } from "../../utils/jwt";
import { sessionCookieOptions } from "../../constants/cookies";
import { REMEMBERED_SESSION_TTL_MS } from "../../config/auth";

test("emails are trimmed and lowercased", () => {
  assert.equal(normalizeEmail("  Jane.Doe@Example.COM "), "jane.doe@example.com");
  assert.equal(emailSchema.parse(" Jane@Example.com "), "jane@example.com");
  assert.equal(emailSchema.safeParse("not-an-email").success, false);
});

test("new-password policy: 8–72, upper, lower, number, special", () => {
  const rejected: [string, string[]][] = [
    ["123", ["length", "uppercase", "lowercase", "special"]],
    ["password", ["uppercase", "number", "special"]],
    ["password1", ["uppercase", "special"]],
    ["Password1", ["special"]],
    ["Password!", ["number"]],
    ["PASSWORD1!", ["lowercase"]],
    ["Pass word 1", ["special"]], // whitespace is not a special character
    ["Aa1!" + "x".repeat(69), ["maxLength"]], // 73 chars
    ["Aa1!" + "é".repeat(35), ["maxLength"]], // 39 chars but 74 bytes
  ];
  for (const [password, failed] of rejected) {
    assert.deepEqual(passwordPolicyViolations(password), failed, password);
    assert.equal(newPasswordSchema.safeParse(password).success, false, password);
  }
  for (const password of ["Password1!", "Amr@2026", "Secure#Pass9", "Aa1!" + "x".repeat(68)]) {
    assert.deepEqual(passwordPolicyViolations(password), [], password);
    assert.equal(newPasswordSchema.safeParse(password).success, true, password);
  }
});

test("password verification fails closed for accounts without a password", async () => {
  assert.equal(await verifyPassword("anything1", null), false);
  const hash = await hashPassword("s3cret-pass");
  assert.equal(await verifyPassword("s3cret-pass", hash), true);
  assert.equal(await verifyPassword("wrong-pass1", hash), false);
});

test("GitHub email: verified primary wins, unverified addresses are never used", () => {
  assert.equal(
    pickGitHubEmail([
      { email: "Other@x.dev", primary: false, verified: true },
      { email: "Main@X.dev", primary: true, verified: true },
    ]),
    "main@x.dev"
  );
  assert.equal(pickGitHubEmail([{ email: "a@x.dev", primary: true, verified: false }, { email: "b@x.dev", primary: false, verified: true }]), "b@x.dev");
  assert.equal(pickGitHubEmail([{ email: "a@x.dev", primary: true, verified: false }]), null);
  assert.equal(pickGitHubEmail([]), null);
});

test("Google claims: issuer, audience and expiry are enforced; unverified email is dropped", () => {
  const now = 1_000_000;
  const base = { iss: "https://accounts.google.com", aud: "client-1", exp: now + 60, sub: "123", name: "Jane" };
  assert.deepEqual(profileFromGoogleClaims({ ...base, email: "Jane@Gmail.com", email_verified: true }, "client-1", now), {
    providerAccountId: "123",
    email: "jane@gmail.com",
    name: "Jane",
  });
  assert.equal(profileFromGoogleClaims({ ...base, email: "jane@gmail.com", email_verified: false }, "client-1", now).email, null);
  assert.throws(() => profileFromGoogleClaims({ ...base, aud: "someone-else" }, "client-1", now), OAuthExchangeError);
  assert.throws(() => profileFromGoogleClaims({ ...base, iss: "https://evil.example" }, "client-1", now), OAuthExchangeError);
  assert.throws(() => profileFromGoogleClaims({ ...base, exp: now - 1 }, "client-1", now), OAuthExchangeError);
});

test("social decision: linked → login; unverified → stop; same email → link; else signup", () => {
  assert.deepEqual(decideSocialOutcome({ linkedUserId: "u1", verifiedEmail: null, existingUserId: null }), { kind: "login", userId: "u1" });
  assert.deepEqual(decideSocialOutcome({ linkedUserId: "u1", verifiedEmail: "a@b.co", existingUserId: "u2" }), { kind: "login", userId: "u1" });
  // An unverified (null) email never links, even if an account "matches".
  assert.deepEqual(decideSocialOutcome({ linkedUserId: null, verifiedEmail: null, existingUserId: "u2" }), { kind: "email_missing" });
  assert.deepEqual(decideSocialOutcome({ linkedUserId: null, verifiedEmail: "a@b.co", existingUserId: "u2" }), { kind: "link", userId: "u2", email: "a@b.co" });
  assert.deepEqual(decideSocialOutcome({ linkedUserId: null, verifiedEmail: "a@b.co", existingUserId: null }), { kind: "signup", email: "a@b.co" });
});

test("SMTP config: required fields, auth pairing and TLS defaults", () => {
  assert.deepEqual(readSmtpConfig({}), { config: null, problems: [] });
  const ok = readSmtpConfig({ SMTP_HOST: "smtp.example.com", SMTP_PORT: "465", SMTP_USER: "u", SMTP_PASSWORD: "p", SMTP_FROM: "App <a@b.co>" });
  assert.equal(ok.config?.secure, true);
  assert.equal(readSmtpConfig({ SMTP_HOST: "h", SMTP_FROM: "a@b.co" }).config?.port, 587);
  assert.equal(readSmtpConfig({ SMTP_HOST: "h", SMTP_FROM: "a@b.co" }).config?.secure, false);
  assert.equal(readSmtpConfig({ SMTP_HOST: "h", SMTP_FROM: "a@b.co", SMTP_PORT: "587", SMTP_SECURE: "true" }).config?.secure, true);
  const missingFrom = readSmtpConfig({ SMTP_HOST: "h" });
  assert.equal(missingFrom.config, null);
  assert.ok(!missingFrom.config && missingFrom.problems.some((p) => p.includes("SMTP_FROM")));
  const halfAuth = readSmtpConfig({ SMTP_HOST: "h", SMTP_FROM: "a@b.co", SMTP_USER: "u" });
  assert.ok(!halfAuth.config && halfAuth.problems.some((p) => p.includes("together")));
});

test("session and short-lived tokens can't be swapped for each other", () => {
  const session = signAuthToken({ userId: "u1", tokenVersion: 3 }, false);
  assert.deepEqual(verifyAuthToken(session), { userId: "u1", tokenVersion: 3 });
  assert.equal(verifyTypedToken("social_pending", session), null);

  const pending = signTypedToken("social_pending", { userId: "u1", email: "a@b.co" }, 60_000);
  assert.throws(() => verifyAuthToken(pending));
  assert.equal(verifyTypedToken("oauth_state", pending), null);
  assert.equal(verifyTypedToken("social_pending", pending + "x"), null);
});

test("remember me controls cookie persistence; JWT lifetime matches", () => {
  assert.equal(sessionCookieOptions(false).maxAge, undefined);
  assert.equal(sessionCookieOptions(true).maxAge, REMEMBERED_SESSION_TTL_MS);
  for (const remember of [false, true]) {
    const options = sessionCookieOptions(remember);
    assert.equal(options.httpOnly, true);
  }
  const decode = (t: string) => JSON.parse(Buffer.from(t.split(".")[1]!, "base64url").toString()) as { iat: number; exp: number };
  const short = decode(signAuthToken({ userId: "u", tokenVersion: 0 }, false));
  const long = decode(signAuthToken({ userId: "u", tokenVersion: 0 }, true));
  assert.equal(short.exp - short.iat, 12 * 60 * 60);
  assert.equal(long.exp - long.iat, REMEMBERED_SESSION_TTL_MS / 1000);
});
