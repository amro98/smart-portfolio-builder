/**
 * What to do with a provider identity after the OAuth round-trip. Pure, so the rules are
 * unit-tested in one place:
 *
 * 1. Identity already linked            → sign in as its user.
 * 2. No verified email from the provider → stop (we never act on unverified emails).
 * 3. A user already owns that email      → offer to LINK this identity to that user (confirmed by the user).
 * 4. Otherwise                            → offer to CREATE a new account (confirmed by the user).
 */
export type SocialDecision =
  | { kind: "login"; userId: string }
  | { kind: "email_missing" }
  | { kind: "link"; userId: string; email: string }
  | { kind: "signup"; email: string };

export function decideSocialOutcome(input: {
  linkedUserId: string | null;
  /** Normalized email, or null when the provider didn't supply a verified one. */
  verifiedEmail: string | null;
  existingUserId: string | null;
}): SocialDecision {
  if (input.linkedUserId) return { kind: "login", userId: input.linkedUserId };
  if (!input.verifiedEmail) return { kind: "email_missing" };
  if (input.existingUserId) return { kind: "link", userId: input.existingUserId, email: input.verifiedEmail };
  return { kind: "signup", email: input.verifiedEmail };
}
