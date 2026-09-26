// Mirrors the backend's new-password policy (Backend/src/modules/auth/password-policy.ts) for
// live feedback on Register and Reset Password. The backend remains the authority. Login does
// not use these rules: older accounts may have passwords from the previous policy.

export type PasswordRuleId = 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';

const MAX_BYTES = 72;

/** Rules shown in the checklist, in display order. */
export const PASSWORD_RULES: { id: PasswordRuleId; labelKey: string; test: (password: string) => boolean }[] = [
  { id: 'length', labelKey: 'auth.password.rule.length', test: (p) => [...p].length >= 8 },
  { id: 'uppercase', labelKey: 'auth.password.rule.uppercase', test: (p) => /\p{Lu}/u.test(p) },
  { id: 'lowercase', labelKey: 'auth.password.rule.lowercase', test: (p) => /\p{Ll}/u.test(p) },
  { id: 'number', labelKey: 'auth.password.rule.number', test: (p) => /\p{Nd}/u.test(p) },
  // Anything that isn't a letter, digit or whitespace.
  { id: 'special', labelKey: 'auth.password.rule.special', test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];

export function isPasswordTooLong(password: string) {
  return new TextEncoder().encode(password).length > MAX_BYTES;
}

export function meetsPasswordPolicy(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password)) && !isPasswordTooLong(password);
}

/** Field-level error key for a new password, or undefined when it's acceptable. */
export function passwordRuleError(password: string): string | undefined {
  if (!password) return 'auth.register.errors.password.required';
  if (isPasswordTooLong(password)) return 'auth.password.tooLong';
  if (!meetsPasswordPolicy(password)) return 'auth.password.requirementsNotMet';
  return undefined;
}
