import { NextResponse } from "next/server";
import { notifyAdminOfLibrarySubmission } from "@/lib/library-notify-submission";
import { normalizeLibraryUrl } from "@/lib/library-url";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isMailConfigured } from "@/lib/mail";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";

export const maxDuration = 30;

type NotifySubmissionBody = {
  url: string;
  title: string;
  submitterEmail?: string | null;
  contributorDisplayName?: string | null;
  turnstileToken?: string;
};

/** Legacy endpoint — prefer /api/library/submit which saves and notifies in one step. */
export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!checkRateLimit(`library-notify:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const turnstileError = requireTurnstileInProduction();
  if (turnstileError) {
    return NextResponse.json({ error: turnstileError }, { status: 503 });
  }

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

  const url = normalizeLibraryUrl(typeof body.url === "string" ? body.url : "") ?? "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  if (!url || !title) {
    return NextResponse.json({ error: "Missing url or title." }, { status: 400 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured on the server." },
      { status: 503 }
    );
  }

  const sent = await notifyAdminOfLibrarySubmission({
    url,
    title,
    submitterEmail: body.submitterEmail,
    contributorDisplayName: body.contributorDisplayName,
  });

  if (!sent) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
