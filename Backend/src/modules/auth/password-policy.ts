import { z } from "zod";

// The single source of truth for NEW passwords (register + reset). Login deliberately does
// not use it: accounts created under older rules must still be able to sign in.
// The frontend mirrors these rules in src/features/auth/password-rules.ts for live feedback.

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes, so longer passwords are rejected, not silently truncated.
export const PASSWORD_MAX_BYTES = 72;

export type PasswordRuleId = "length" | "uppercase" | "lowercase" | "number" | "special" | "maxLength";

// Unicode-aware, so e.g. accented capitals count as uppercase. "Special" means anything that
// isn't a letter, digit or whitespace (!, @, #, -, _, …).
const RULES: { id: PasswordRuleId; test: (password: string) => boolean }[] = [
  { id: "length", test: (p) => [...p].length >= PASSWORD_MIN_LENGTH },
  { id: "uppercase", test: (p) => /\p{Lu}/u.test(p) },
  { id: "lowercase", test: (p) => /\p{Ll}/u.test(p) },
  { id: "number", test: (p) => /\p{Nd}/u.test(p) },
  { id: "special", test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
  { id: "maxLength", test: (p) => Buffer.byteLength(p, "utf8") <= PASSWORD_MAX_BYTES },
];

/** Ids of the rules this password fails; empty when it satisfies the policy. */
export function passwordPolicyViolations(password: string): PasswordRuleId[] {
  return RULES.filter((rule) => !rule.test(password)).map((rule) => rule.id);
}

/** Zod schema for a new password. Issue messages are rule ids — never the password itself. */
export const newPasswordSchema = z.string().superRefine((password, ctx) => {
  for (const id of passwordPolicyViolations(password)) {
    ctx.addIssue({ code: "custom", message: id });
  }
});
