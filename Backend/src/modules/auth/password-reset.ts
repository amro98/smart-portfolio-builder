import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../../db/prisma";
import { PASSWORD_RESET_TTL_MS, getFrontendUrl } from "../../config/auth";
import { getMailer } from "../../services/mailer";
import { hashPassword } from "./credentials";

export function hashResetToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Issues a reset token for the user with this (normalized) email, if one exists, and emails
 * the link. Callers must respond identically whether or not an account was found.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) return;

  const token = randomBytes(32).toString("base64url");
  const now = new Date();

  await prisma.$transaction([
    // Only the newest link works: requesting another one retires any outstanding tokens.
    prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: now } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS) },
    }),
  ]);

  const url = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const minutes = Math.round(PASSWORD_RESET_TTL_MS / 60000);

  await getMailer().send({
    to: user.email,
    subject: "Reset your Smart Portfolio Builder password",
    text: [
      "We received a request to reset the password for your Smart Portfolio Builder account.",
      "",
      `Reset your password: ${url}`,
      "",
      `This link expires in ${minutes} minutes and can only be used once.`,
      "If you didn't request this, you can ignore this email — your password won't change.",
    ].join("\n"),
    html: `<p>We received a request to reset the password for your Smart Portfolio Builder account.</p>
<p><a href="${url}">Reset your password</a></p>
<p>This link expires in ${minutes} minutes and can only be used once.<br>If you didn't request this, you can ignore this email — your password won't change.</p>`,
  });
}

/** True if the token exists, is unused and not expired. Does not consume it. */
export async function isResetTokenUsable(token: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } });
  return !!record && !record.usedAt && record.expiresAt > new Date();
}

export type ResetResult = { ok: true } | { ok: false; reason: "invalid" | "expired" };

/**
 * Consumes the token and sets the new password. The token is claimed with a conditional
 * update, so two concurrent requests can't both use it. On success every outstanding token
 * for the user is retired and all existing sessions are revoked (tokenVersion bump).
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<ResetResult> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } });
  if (!record || record.usedAt) return { ok: false, reason: "invalid" };
  if (record.expiresAt <= new Date()) return { ok: false, reason: "expired" };

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count !== 1) return { ok: false, reason: "invalid" } as const;

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: now } });
    return { ok: true } as const;
  });
}
