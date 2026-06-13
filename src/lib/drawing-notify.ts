import { escapeHtml } from "@/lib/html-escape";
import { ADMIN_EMAIL } from "@/lib/library";
import { sendFoundationEmail, isMailConfigured } from "@/lib/mail";

type NotifyPayload = {
  entryId: string;
  title: string;
  artistName: string;
  imageUrl: string;
};

export async function notifyAdminOfDrawingSubmission(payload: NotifyPayload): Promise<void> {
  if (!isMailConfigured()) return;

  const subject = `New drawing competition entry: ${payload.title}`;
  const text = [
    `A new artwork was posted to the drawing competition.`,
    ``,
    `Title: ${payload.title}`,
    `Artist: ${payload.artistName}`,
    `Entry ID: ${payload.entryId}`,
    `Image: ${payload.imageUrl}`,
    ``,
    `Review: https://www.agrawalfoundation.org/admin/drawing`,
  ].join("\n");

  const html = `
    <p>A new artwork was posted to the drawing competition.</p>
    <ul>
      <li><strong>Title:</strong> ${escapeHtml(payload.title)}</li>
      <li><strong>Artist:</strong> ${escapeHtml(payload.artistName)}</li>
      <li><strong>Entry ID:</strong> ${escapeHtml(payload.entryId)}</li>
    </ul>
    <p><a href="${escapeHtml(payload.imageUrl)}">View image</a></p>
    <p><a href="https://www.agrawalfoundation.org/admin/drawing">Open admin</a></p>
  `;

  await sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject,
    text,
    html,
  });
}

type ReportPayload = {
  entryId: string;
  title: string;
  reason: string;
  details?: string;
};

export async function notifyAdminOfDrawingReport(payload: ReportPayload): Promise<void> {
  if (!isMailConfigured()) return;

  const subject = `Drawing report: ${payload.title}`;
  const text = [
    `An entry was reported in the drawing competition.`,
    ``,
    `Entry: ${payload.title} (${payload.entryId})`,
    `Reason: ${payload.reason}`,
    payload.details ? `Details: ${payload.details}` : "",
    ``,
    `Review: https://www.agrawalfoundation.org/admin/drawing`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>An entry was reported in the drawing competition.</p>
    <ul>
      <li><strong>Entry:</strong> ${escapeHtml(payload.title)} (${escapeHtml(payload.entryId)})</li>
      <li><strong>Reason:</strong> ${escapeHtml(payload.reason)}</li>
      ${payload.details ? `<li><strong>Details:</strong> ${escapeHtml(payload.details)}</li>` : ""}
    </ul>
    <p><a href="https://www.agrawalfoundation.org/admin/drawing">Open admin</a></p>
  `;

  await sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject,
    text,
    html,
  });
}
