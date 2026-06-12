import nodemailer from "nodemailer";
import { env, isEmailConfigured, isProduction } from "../config/env.js";

/**
 * Email service
 * ----------------------------------------------------------------------------
 * - When SMTP is configured (SMTP_HOST set), a real, pooled transporter is used.
 * - When SMTP is NOT configured, we fall back to a no-network "stream" transport
 *   in development so auth/notification flows keep working and the rendered
 *   message is logged to the console (great for local demos). In production an
 *   unconfigured SMTP server is treated as a misconfiguration and emails are
 *   skipped with a clear warning.
 *
 * Configure via .env: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 * SMTP_FROM, SMTP_REPLY_TO.
 */

let transporter = null;

function buildTransporter() {
  if (isEmailConfigured) {
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      pool: env.smtp.pool,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
      tls: { rejectUnauthorized: env.smtp.rejectUnauthorized },
    });
  }

  // Dev fallback: no network, just render the message so it can be logged.
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

/** Lazily create and reuse a single transporter instance. */
export function getTransporter() {
  if (!transporter) {
    transporter = buildTransporter();
  }
  return transporter;
}

/**
 * Verify the SMTP connection at startup. Never throws — logs status so a bad
 * mail config can't crash the API boot sequence.
 */
export async function verifyEmailTransport() {
  if (!isEmailConfigured) {
    const message =
      "SMTP not configured (SMTP_HOST is empty). Emails will be logged to the console, not delivered.";
    if (isProduction) {
      console.warn(`[email] WARNING: ${message}`);
    } else {
      console.info(`[email] ${message}`);
    }
    return false;
  }

  try {
    await getTransporter().verify();
    console.log(
      `[email] SMTP ready at ${env.smtp.host}:${env.smtp.port} (secure=${env.smtp.secure}).`
    );
    return true;
  } catch (error) {
    console.error(`[email] SMTP verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Send an email. Resolves with delivery info; never rejects for non-critical
 * mail so callers can fire-and-forget without breaking core flows.
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!to) {
    console.warn("[email] sendEmail called without a recipient; skipping.");
    return { skipped: true, reason: "no-recipient" };
  }

  const message = {
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
    replyTo: replyTo || env.smtp.replyTo || undefined,
  };

  try {
    const info = await getTransporter().sendMail(message);

    if (!isEmailConfigured) {
      // streamTransport: surface the rendered message for local debugging.
      const preview = info.message ? info.message.toString() : "";
      console.info(
        `[email] (dev, not delivered) To=${to} Subject="${subject}"\n${preview}`
      );
      return { skipped: true, reason: "smtp-not-configured", info };
    }

    console.log(`[email] Sent to ${to} (messageId=${info.messageId}).`);
    return { delivered: true, info };
  } catch (error) {
    console.error(`[email] Failed to send to ${to}: ${error.message}`);
    return { delivered: false, error: error.message };
  }
}

/* --------------------------------------------------------------------------
 * Template helpers
 * ------------------------------------------------------------------------ */

function layout(title, bodyHtml) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ece7e1;border-radius:14px;overflow:hidden;">
          <tr><td style="background:#fa520f;padding:20px 28px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Far Away</span>
            <span style="color:#ffd9c7;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-left:8px;">Learning Arena</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="font-size:20px;margin:0 0 16px;color:#111827;">${title}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #ece7e1;color:#9ca3af;font-size:11px;">
            You're receiving this because you have a Far Away account. If this wasn't you, you can ignore this email.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(label, url) {
  return `<a href="${url}" style="display:inline-block;background:#fa520f;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9px;">${label}</a>`;
}

/** Welcome email sent after a successful registration. */
export async function sendWelcomeEmail(user) {
  const firstName = user.firstName || "there";
  const dashboardUrl = env.clientUrl;
  const html = layout(
    `Welcome to Far Away, ${firstName}!`,
    `<p style="font-size:14px;line-height:1.6;margin:0 0 18px;">Your account is ready. Start taking assessments, earn coins and XP, climb the leaderboards, and swap skills with peers.</p>
     <p style="margin:0 0 24px;">${button("Open your dashboard", dashboardUrl)}</p>
     <p style="font-size:13px;color:#6b7280;margin:0;">You start with <strong>500 coins</strong> — score 80%+ on assessments to earn more.</p>`
  );
  const text = `Welcome to Far Away, ${firstName}! Your account is ready. Open your dashboard: ${dashboardUrl}. You start with 500 coins.`;

  return sendEmail({
    to: user.email,
    subject: "Welcome to Far Away \u{1F680}",
    text,
    html,
  });
}

/** Password reset email with a tokenized link. */
export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const html = layout(
    "Reset your password",
    `<p style="font-size:14px;line-height:1.6;margin:0 0 18px;">We received a request to reset your Far Away password. This link expires in 30 minutes.</p>
     <p style="margin:0 0 24px;">${button("Reset password", resetUrl)}</p>
     <p style="font-size:12px;color:#9ca3af;margin:0;word-break:break-all;">Or paste this link into your browser: ${resetUrl}</p>`
  );
  const text = `Reset your Far Away password using this link (expires in 30 minutes): ${resetUrl}`;

  return sendEmail({
    to: user.email,
    subject: "Reset your Far Away password",
    text,
    html,
  });
}
