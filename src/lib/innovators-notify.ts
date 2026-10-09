import { escapeHtml } from "@/lib/html-escape";
import { ADMIN_EMAIL } from "@/lib/library";
import { sendFoundationEmail, isMailConfigured } from "@/lib/mail";

type NotifyPayload = {
  entryId: string;
  title: string;
  childName: string;
  parentEmail: string;
  photo1Url: string;
  photo2Url: string;
  videoUrl: string;
};

export async function notifyAdminOfInnovatorsSubmission(payload: NotifyPayload): Promise<void> {
  if (!isMailConfigured()) return;

  const subject = `Young Innovators Challenge entry: ${payload.title}`;
  const text = [
    `A new Young Innovators Challenge entry was submitted (pending review).`,
    ``,
    `Title: ${payload.title}`,
    `Child: ${payload.childName}`,
    `Email: ${payload.parentEmail}`,
    `Entry ID: ${payload.entryId}`,
    `Approve at: /admin/innovators`,
    `Photo 1: ${payload.photo1Url}`,
    `Photo 2: ${payload.photo2Url}`,
    `Video: ${payload.videoUrl}`,
  ].join("\n");

  const html = `
    <p>A new <strong>Young Innovators Challenge</strong> entry was submitted (pending review).</p>
    <ul>
      <li><strong>Title:</strong> ${escapeHtml(payload.title)}</li>
      <li><strong>Child:</strong> ${escapeHtml(payload.childName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(payload.parentEmail)}</li>
      <li><strong>Entry ID:</strong> ${escapeHtml(payload.entryId)}</li>
    </ul>
    <p><a href="https://agrawalfoundation.org/admin/innovators">Open admin</a></p>
    <p>
      <a href="${escapeHtml(payload.photo1Url)}">Photo 1</a> ·
      <a href="${escapeHtml(payload.photo2Url)}">Photo 2</a> ·
      <a href="${escapeHtml(payload.videoUrl)}">Video</a>
    </p>
  `;

  await sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject,
    text,
    html,
    replyTo: payload.parentEmail,
  });
}

type ReportPayload = {
  entryId: string;
  title: string;
  reason: string;
  details?: string;
};

export async function notifyAdminOfInnovatorsReport(payload: ReportPayload): Promise<void> {
  if (!isMailConfigured()) return;

  const subject = `Young Innovators report: ${payload.title}`;
  const text = [
    `A gallery entry was reported.`,
    `Title: ${payload.title}`,
    `Entry ID: ${payload.entryId}`,
    `Reason: ${payload.reason}`,
    payload.details ? `Details: ${payload.details}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>A <strong>Young Innovators</strong> gallery entry was reported.</p>
    <ul>
      <li><strong>Title:</strong> ${escapeHtml(payload.title)}</li>
      <li><strong>Entry ID:</strong> ${escapeHtml(payload.entryId)}</li>
      <li><strong>Reason:</strong> ${escapeHtml(payload.reason)}</li>
      ${payload.details ? `<li><strong>Details:</strong> ${escapeHtml(payload.details)}</li>` : ""}
    </ul>
  `;

  await sendFoundationEmail({ to: ADMIN_EMAIL, subject, text, html });
}
