import nodemailer from "nodemailer";
import { env } from "./keys.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  // Port 465 is implicit TLS; anything else (e.g. Brevo's 2525) starts
  // plaintext and upgrades via STARTTLS — `secure` must match the port.
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: env.NODE_ENV === "production",
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Generic send primitive only — no knowledge of verification codes or any
// other specific email type, and no swallowed errors: a caller sending a
// critical email (e.g. the one code a signup needs to ever get verified)
// needs the failure to actually surface, not vanish silently.
export const sendEmail = async ({ to, subject, text, html }: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};
