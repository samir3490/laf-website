import nodemailer from "nodemailer";

export function getMailer() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function getMailFromAddress(): string | null {
  return process.env.GMAIL_USER?.trim() ?? null;
}

export function getMailFromName(): string {
  return process.env.GMAIL_FROM_NAME?.trim() || "Lata Agrawal Foundation";
}

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export async function sendFoundationEmail(options: SendMailOptions): Promise<boolean> {
  const transporter = getMailer();
  const fromUser = getMailFromAddress();
  if (!transporter || !fromUser) return false;

  try {
    await transporter.sendMail({
      from: `"${getMailFromName()}" <${fromUser}>`,
      to: options.to,
      replyTo: options.replyTo ?? fromUser,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch {
    return false;
  }
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""));
}
