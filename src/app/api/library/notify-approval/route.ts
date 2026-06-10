import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getSite } from "@/lib/content";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";
import { isLibraryAdmin } from "@/lib/library";

export const maxDuration = 30;

type NotifyBody = {
  to: string;
  resourceTitle: string;
  resourceSlug: string;
};

function getMailer() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function POST(req: Request) {
  const adminEmail = await verifyLibraryAdminRequest(req);
  if (!adminEmail || !isLibraryAdmin(adminEmail)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: NotifyBody;
  try {
    body = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { to, resourceTitle, resourceSlug } = body;
  if (!to?.includes("@") || !resourceTitle?.trim() || !resourceSlug?.trim()) {
    return NextResponse.json({ error: "Missing to, resourceTitle, or resourceSlug." }, { status: 400 });
  }

  const transporter = getMailer();
  if (!transporter) {
    return NextResponse.json(
      { error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured on the server." },
      { status: 503 }
    );
  }

  const site = getSite();
  const resourceUrl = `${site.url.replace(/\/$/, "")}/library/${resourceSlug}`;
  const fromUser = process.env.GMAIL_USER!.trim();

  try {
    await transporter.sendMail({
      from: `"${site.name}" <${fromUser}>`,
      to: to.trim(),
      replyTo: fromUser,
      subject: `Your library resource was approved — ${resourceTitle}`,
      text: [
        `Thank you for submitting a resource to the ${site.name} Learning Library.`,
        "",
        `"${resourceTitle}" has been reviewed and approved.`,
        "",
        `View it here: ${resourceUrl}`,
        "",
        `— ${site.name}`,
      ].join("\n"),
      html: [
        `<p>Thank you for submitting a resource to the <strong>${site.name}</strong> Learning Library.</p>`,
        `<p><strong>${resourceTitle}</strong> has been reviewed and approved.</p>`,
        `<p><a href="${resourceUrl}">View your resource on the library</a></p>`,
        `<p>— ${site.name}</p>`,
      ].join(""),
    });

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
