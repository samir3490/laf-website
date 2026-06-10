import { NextResponse } from "next/server";
import { analyzeResource } from "@/lib/library-analyze";
import { fetchPageMetadata, normalizeLibraryUrl } from "@/lib/library-url";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Daily submission limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!rawUrl) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const urlNormalized = normalizeLibraryUrl(rawUrl);
    if (!urlNormalized) {
      return NextResponse.json({ error: "Please enter a valid http or https URL." }, { status: 400 });
    }

    const meta = await fetchPageMetadata(urlNormalized);
    if (!meta) {
      return NextResponse.json(
        { error: "Could not fetch this website. Check the URL and try again." },
        { status: 422 }
      );
    }

    const analysis = await analyzeResource(meta);

    return NextResponse.json({
      url: meta.url,
      urlNormalized,
      title: analysis.title,
      description: analysis.description,
      ogImage: meta.ogImage,
      favicon: meta.favicon,
      categories: analysis.categories,
      ageGroups: analysis.ageGroups,
      difficulty: analysis.difficulty,
      cost: analysis.cost,
      languages: analysis.languages,
      module: analysis.module,
      safetyScore: analysis.safetyScore,
      educationalScore: analysis.educationalScore,
      rejected: analysis.rejected,
      rejectReason: analysis.rejectReason,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
