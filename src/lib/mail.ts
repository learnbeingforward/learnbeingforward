import nodemailer from "nodemailer";

/** Sends real email via SMTP — works with Hostinger's own hosted mailboxes (e.g.
 * smtp.hostinger.com) or any other SMTP provider. Optional by design, same
 * pattern as CODE_EXEC_API_KEY: without it configured, callers get a clear error
 * instead of the app crashing, and can decide for themselves whether that should
 * block the request or just be logged. */
export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number.parseInt(process.env.SMTP_PORT ?? "465", 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !pass) {
    throw new Error(
      "Email isn't configured yet — set SMTP_HOST, SMTP_USER, and SMTP_PASS (see your Hostinger email account's SMTP settings) in the environment."
    );
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
  });
}
