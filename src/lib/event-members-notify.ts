import { escapeHtml } from "@/lib/html-escape";
import { EVENTS_SITE_ORIGIN } from "@/lib/event-members";
import { isMailConfigured, sendFoundationEmail } from "@/lib/mail";

export async function sendEventMemberWelcomeEmail(email: string, displayName?: string | null): Promise<boolean> {
  if (!isMailConfigured()) return false;

  const name = displayName?.trim() || "friend";
  const subject = "You’re signed up for LAF event updates";
  const text = [
    `Hi ${name},`,
    ``,
    `Thank you for signing up on the Lata Agrawal Foundation events page.`,
    `We’ll email you when we announce new competitions and challenges.`,
    ``,
    `You can turn updates off anytime here:`,
    `${EVENTS_SITE_ORIGIN}/events`,
    ``,
    `With care,`,
    `Lata Agrawal Foundation`,
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thank you for signing up on the <strong>Lata Agrawal Foundation</strong> events page.</p>
    <p>We’ll email you when we announce new competitions and challenges.</p>
    <p><a href="${EVENTS_SITE_ORIGIN}/events">Manage your preferences</a></p>
    <p>With care,<br/>Lata Agrawal Foundation</p>
  `;

  return sendFoundationEmail({ to: email, subject, text, html });
}

export async function sendNewEventAnnouncementEmail(options: {
  to: string;
  title: string;
  message: string;
  linkUrl: string;
}): Promise<boolean> {
  if (!isMailConfigured()) return false;

  const subject = `New LAF event: ${options.title}`;
  const text = [
    `Lata Agrawal Foundation — new event`,
    ``,
    options.title,
    ``,
    options.message,
    ``,
    `Learn more: ${options.linkUrl}`,
    ``,
    `Manage email preferences: ${EVENTS_SITE_ORIGIN}/events`,
  ].join("\n");

  const html = `
    <p><strong>Lata Agrawal Foundation</strong> — new event</p>
    <h2 style="color:#1e3a5f">${escapeHtml(options.title)}</h2>
    <p>${escapeHtml(options.message).replace(/\n/g, "<br/>")}</p>
    <p><a href="${escapeHtml(options.linkUrl)}" style="display:inline-block;padding:10px 16px;background:#c9a227;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open event</a></p>
    <p style="font-size:12px;color:#666"><a href="${EVENTS_SITE_ORIGIN}/events">Manage email preferences</a></p>
  `;

  return sendFoundationEmail({ to: options.to, subject, text, html });
}
