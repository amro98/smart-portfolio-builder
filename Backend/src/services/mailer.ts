import nodemailer, { type Transporter } from "nodemailer";

import { isProduction } from "../config/auth";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface Mailer {
  readonly kind: "smtp" | "console" | "unconfigured";
  send(message: MailMessage): Promise<void>;
}

/** "jane@example.com" → "j***@example.com" — enough to trace delivery without logging the address. */
function maskAddress(address: string) {
  const [local = "", domain = ""] = address.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string | null;
  password: string | null;
  from: string;
};

type SmtpConfigResult = { config: SmtpConfig } | { config: null; problems: string[] };

/**
 * Reads SMTP_* from env. SMTP_HOST and SMTP_FROM are required; SMTP_USER/SMTP_PASSWORD are
 * required together or not at all (local relays such as Mailpit need no auth).
 */
export function readSmtpConfig(env: NodeJS.ProcessEnv = process.env): SmtpConfigResult {
  const host = env.SMTP_HOST?.trim() ?? "";
  const from = env.SMTP_FROM?.trim() ?? "";
  const user = env.SMTP_USER?.trim() || null;
  const password = env.SMTP_PASSWORD || null;
  const portRaw = env.SMTP_PORT?.trim() || "587";
  const port = Number(portRaw);
  const secureRaw = env.SMTP_SECURE?.trim().toLowerCase() ?? "";

  const anySet = [env.SMTP_HOST, env.SMTP_FROM, env.SMTP_USER, env.SMTP_PASSWORD].some((v) => v?.trim());
  if (!anySet) return { config: null, problems: [] };

  const problems: string[] = [];
  if (!host) problems.push("SMTP_HOST is missing");
  if (!from) problems.push("SMTP_FROM is missing");
  if (!Number.isInteger(port) || port <= 0 || port > 65535) problems.push("SMTP_PORT is not a valid port");
  if (!!user !== !!password) problems.push("SMTP_USER and SMTP_PASSWORD must be set together");
  if (secureRaw && !["true", "false", "1", "0", "yes", "no"].includes(secureRaw)) problems.push("SMTP_SECURE must be true or false");
  if (problems.length > 0) return { config: null, problems };

  return {
    config: {
      host,
      port,
      // Port 465 is implicit TLS; other ports (587/25/2525) upgrade with STARTTLS when offered.
      secure: secureRaw ? ["true", "1", "yes"].includes(secureRaw) : port === 465,
      user,
      password,
      from,
    },
  };
}

/** Real delivery through the SMTP server configured via SMTP_* env vars. */
class SmtpMailer implements Mailer {
  readonly kind = "smtp";

  constructor(
    private readonly transporter: Transporter,
    private readonly from: string
  ) {}

  async send(message: MailMessage) {
    const info = await this.transporter.sendMail({ from: this.from, ...message });
    // Safe to log: no message body, link or token — just who/what/where.
    // eslint-disable-next-line no-console
    console.log(`[mail] sent "${message.subject}" to ${maskAddress(message.to)} (id ${info.messageId ?? "n/a"})`);
  }

  verify() {
    return this.transporter.verify();
  }
}

/**
 * Development-only fallback: prints the message (including any links) to the server console
 * so flows like password reset can be tested locally without an email account. Never used in
 * production, and never used when SMTP is configured.
 */
class ConsoleMailer implements Mailer {
  readonly kind = "console";

  async send(message: MailMessage) {
    // eslint-disable-next-line no-console
    console.log(
      [
        "",
        "──────── [dev mail] ────────",
        `To:      ${message.to}`,
        `Subject: ${message.subject}`,
        "",
        message.text,
        "────────────────────────────",
        "",
      ].join("\n")
    );
  }
}

/** Production without (valid) SMTP config: fail loudly in logs, never print message contents. */
class UnconfiguredMailer implements Mailer {
  readonly kind = "unconfigured";

  async send(message: MailMessage) {
    throw new Error(`SMTP is not configured; could not send "${message.subject}". Set SMTP_HOST and SMTP_FROM.`);
  }
}

function createMailer(): { mailer: Mailer; problems: string[]; smtp?: SmtpConfig } {
  const result = readSmtpConfig();
  if (result.config) {
    const { host, port, secure, user, password, from } = result.config;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && password ? { user, pass: password } : undefined,
      // Never send credentials in plaintext: with auth on a non-TLS port, STARTTLS is mandatory.
      // (Unauthenticated local catchers like Mailpit stay usable without TLS.)
      requireTLS: !secure && !!user,
      // Fail fast instead of hanging a request on an unreachable server.
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
    return { mailer: new SmtpMailer(transporter, from), problems: [], smtp: result.config };
  }
  return { mailer: isProduction ? new UnconfiguredMailer() : new ConsoleMailer(), problems: result.problems };
}

let instance: ReturnType<typeof createMailer> | null = null;

function getInstance() {
  instance ??= createMailer();
  return instance;
}

export function getMailer(): Mailer {
  return getInstance().mailer;
}

/**
 * One-line startup summary of how email will be delivered, plus an SMTP connection check.
 * Never prints credentials.
 */
export function logMailDeliveryMode() {
  const { mailer, problems, smtp } = getInstance();
  /* eslint-disable no-console */
  if (problems.length > 0) {
    console.warn(`[mail] SMTP settings incomplete: ${problems.join("; ")}.`);
  }
  if (mailer instanceof SmtpMailer && smtp) {
    console.log(
      `[mail] Mail delivery: SMTP configured (${smtp.host}:${smtp.port}, ${smtp.secure ? "TLS" : smtp.user ? "STARTTLS required" : "STARTTLS if offered"}, ${smtp.user ? "authenticated" : "no auth"})`
    );
    mailer
      .verify()
      .then(() => console.log("[mail] SMTP connection verified"))
      .catch((error: unknown) => console.error(`[mail] SMTP connection check failed: ${(error as Error)?.message ?? error}`));
  } else if (mailer.kind === "console") {
    console.log("[mail] Mail delivery: development console fallback (set SMTP_* to send real email)");
  } else {
    console.error("[mail] Mail delivery: NOT configured — password reset emails cannot be sent. Set SMTP_* in production.");
  }
  /* eslint-enable no-console */
}
