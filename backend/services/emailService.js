import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendEmail({ to, subject, text, html }) {
  if (!env.smtp.host) {
    console.log(`Email skipped, SMTP not configured. To=${to} Subject=${subject}`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
}
