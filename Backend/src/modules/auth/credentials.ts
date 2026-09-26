import bcrypt from "bcryptjs";
import { z } from "zod";

const BCRYPT_ROUNDS = 12;

/** Emails are compared and stored trimmed + lowercased everywhere. */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const emailSchema = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email())
  .transform(normalizeEmail);

export { newPasswordSchema } from "./password-policy";

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Compared against when the account doesn't exist or has no password, so a failed login
// takes about as long either way and response timing doesn't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", BCRYPT_ROUNDS);

export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

export function sanitizeUser(user: { id: string; email: string; name: string | null; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
