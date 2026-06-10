import { NextResponse } from "next/server";
import { getSite } from "@/lib/content";
import { ADMIN_EMAIL } from "@/lib/library";
import { sendFoundationEmail, isMailConfigured } from "@/lib/mail";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/turnstile";

export const maxDuration = 30;

type NotifySubmissionBody = {
  url: string;
  title: string;
  submitterEmail?: string | null;
  contributorDisplayName?: string | null;
  turnstileToken?: string;
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let body: NotifySubmissionBody;
  try {
    body = (await req.json()) as NotifySubmissionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (isTurnstileEnabled()) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const valid = await verifyTurnstileToken(token, ip);
    if (!valid) {
      return NextResponse.json({ error: "Captcha verification failed." }, { status: 403 });
    }
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!url || !title) {
    return NextResponse.json({ error: "Missing url or title." }, { status: 400 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured on the server." },
      { status: 503 }
    );
  }

  const site = getSite();
  const adminUrl = `${site.url.replace(/\/$/, "")}/admin/library`;
  const submitter = body.contributorDisplayName?.trim();
  const email = body.submitterEmail?.trim();

  const detailLines = [
    `Title: ${title}`,
    `URL: ${url}`,
    submitter ? `Submitted by: ${submitter}` : null,
    email ? `Contact email: ${email}` : null,
  ].filter(Boolean);

  const sent = await sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject: `New library submission for review — ${title}`,
    text: [
      `A new learning resource was submitted on ${site.name}.`,
      "",
      ...detailLines,
      "",
      `Review in admin: ${adminUrl}`,
    ].join("\n"),
    html: [
      `<p>A new learning resource was submitted on <strong>${site.name}</strong>.</p>`,
      "<ul>",
      `<li><strong>Title:</strong> ${title}</li>`,
      `<li><strong>URL:</strong> <a href="${url}">${url}</a></li>`,
      submitter ? `<li><strong>Submitted by:</strong> ${submitter}</li>` : "",
      email ? `<li><strong>Contact email:</strong> <a href="mailto:${email}">${email}</a></li>` : "",
      "</ul>",
      `<p><a href="${adminUrl}">Open admin queue</a></p>`,
    ].join(""),
    replyTo: email || undefined,
  });

  if (!sent) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
