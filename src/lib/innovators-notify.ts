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
    `A new Young Innovators Challenge entry was submitted.`,
    ``,
    `Title: ${payload.title}`,
    `Child: ${payload.childName}`,
    `Parent email: ${payload.parentEmail}`,
    `Entry ID: ${payload.entryId}`,
    `Photo 1: ${payload.photo1Url}`,
    `Photo 2: ${payload.photo2Url}`,
    `Video: ${payload.videoUrl}`,
  ].join("\n");

  const html = `
    <p>A new <strong>Young Innovators Challenge</strong> entry was submitted.</p>
    <ul>
      <li><strong>Title:</strong> ${escapeHtml(payload.title)}</li>
      <li><strong>Child:</strong> ${escapeHtml(payload.childName)}</li>
      <li><strong>Parent email:</strong> ${escapeHtml(payload.parentEmail)}</li>
      <li><strong>Entry ID:</strong> ${escapeHtml(payload.entryId)}</li>
    </ul>
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
