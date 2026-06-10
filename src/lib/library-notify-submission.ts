import { getSite } from "@/lib/content";
import { escapeHtml } from "@/lib/html-escape";
import { ADMIN_EMAIL } from "@/lib/library";
import { isMailConfigured, sendFoundationEmail } from "@/lib/mail";
import { normalizeLibraryUrl } from "@/lib/library-url";

export type SubmissionNotifyInput = {
  url: string;
  title: string;
  submitterEmail?: string | null;
  contributorDisplayName?: string | null;
};

export async function notifyAdminOfLibrarySubmission(input: SubmissionNotifyInput): Promise<boolean> {
  if (!isMailConfigured()) return false;

  const url = normalizeLibraryUrl(input.url) ?? input.url.trim();
  const title = input.title.trim().slice(0, 200);
  if (!url || !title) return false;

  const site = getSite();
  const adminUrl = `${site.url.replace(/\/$/, "")}/admin/library`;
  const submitter = input.contributorDisplayName?.trim().slice(0, 80) ?? "";
  const email = input.submitterEmail?.trim().slice(0, 120) ?? "";

  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(url);
  const safeSubmitter = submitter ? escapeHtml(submitter) : "";
  const safeEmail = email ? escapeHtml(email) : "";

  return sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject: `New library submission for review — ${title}`,
    text: [
      `A new learning resource was submitted on ${site.name}.`,
      "",
      `Title: ${title}`,
      `URL: ${url}`,
      submitter ? `Submitted by: ${submitter}` : null,
      email ? `Contact email: ${email}` : null,
      "",
      `Review in admin: ${adminUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: [
      `<p>A new learning resource was submitted on <strong>${escapeHtml(site.name)}</strong>.</p>`,
      "<ul>",
      `<li><strong>Title:</strong> ${safeTitle}</li>`,
      `<li><strong>URL:</strong> <a href="${safeUrl}">${safeUrl}</a></li>`,
      safeSubmitter ? `<li><strong>Submitted by:</strong> ${safeSubmitter}</li>` : "",
      safeEmail ? `<li><strong>Contact email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></li>` : "",
      "</ul>",
      `<p><a href="${escapeHtml(adminUrl)}">Open admin queue</a></p>`,
    ].join(""),
    replyTo: email || undefined,
  });
}
