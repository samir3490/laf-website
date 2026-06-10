import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { analyzeResource } from "@/lib/library-analyze";
import { notifyAdminOfLibrarySubmission } from "@/lib/library-notify-submission";
import { fetchPageMetadata, normalizeLibraryUrl } from "@/lib/library-url";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`library-submit:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Daily submission limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const turnstileError = requireTurnstileInProduction();
    if (turnstileError) {
      return NextResponse.json({ error: turnstileError }, { status: 503 });
    }

    const body = await req.json();

    if (isTurnstileEnabled()) {
      const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      const valid = await verifyTurnstileToken(token, ip);
      if (!valid) {
        return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 403 });
      }
    }

    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!rawUrl) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const urlNormalized = normalizeLibraryUrl(rawUrl);
    if (!urlNormalized) {
      return NextResponse.json({ error: "Please enter a valid http or https URL." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Library submissions are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const dupSnap = await adminDb
      .collection("library_resources")
      .where("urlNormalized", "==", urlNormalized)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return NextResponse.json({ error: "This website is already in our library." }, { status: 409 });
    }

    const meta = await fetchPageMetadata(urlNormalized);
    if (!meta) {
      return NextResponse.json(
        { error: "Could not fetch this website. Check the URL and try again." },
        { status: 422 }
      );
    }

    const analysis = await analyzeResource(meta);

    if (analysis.rejected) {
      return NextResponse.json(
        {
          rejected: true,
          rejectReason: analysis.rejectReason ?? "This website did not pass our safety review.",
        },
        { status: 422 }
      );
    }

    const submitterEmail =
      typeof body.submitterEmail === "string" ? body.submitterEmail.trim().slice(0, 120) : "";
    const contributorDisplayName =
      typeof body.contributorDisplayName === "string" ? body.contributorDisplayName.trim().slice(0, 80) : "";
    const notifyOnApproval = body.notifyOnApproval === true && Boolean(submitterEmail);

    await adminDb.collection("library_submissions").add({
      url: meta.url,
      urlNormalized,
      title: analysis.title,
      description: analysis.description,
      ogImage: meta.ogImage ?? "",
      favicon: meta.favicon ?? "",
      categories: analysis.categories,
      ageGroups: analysis.ageGroups,
      difficulty: analysis.difficulty,
      cost: analysis.cost,
      languages: analysis.languages,
      module: analysis.module,
      safetyScore: analysis.safetyScore,
      educationalScore: analysis.educationalScore,
      status: "pending",
      submitterEmail: submitterEmail || null,
      contributorDisplayName: contributorDisplayName || null,
      notifyOnApproval,
      eligibility: analysis.eligibility ?? null,
      deadline: analysis.deadline ?? null,
      ageMin: analysis.ageMin ?? null,
      ageMax: analysis.ageMax ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    await notifyAdminOfLibrarySubmission({
      url: meta.url,
      title: analysis.title,
      submitterEmail: submitterEmail || null,
      contributorDisplayName: contributorDisplayName || null,
    });

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
