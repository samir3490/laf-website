import { NextResponse } from "next/server";
import seedResources from "@/content/library-resources.json";
import { normalizeLibraryUrl } from "@/lib/library-url";

const rateMap = new Map<string, number>();

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "LAF-Library-LinkChecker/1.0",
        Range: "bytes=0-0",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    return { ok: res.ok || res.status === 206, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const isCron = Boolean(cronSecret && auth === `Bearer ${cronSecret}`);

  if (!isCron) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = rateMap.get(ip) ?? 0;
    if (count >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }
    rateMap.set(ip, count + 1);
  }

  const results: {
    slug: string;
    url: string;
    ok: boolean;
    status: number;
  }[] = [];

  for (const item of seedResources as { slug: string; url: string }[]) {
    const url = normalizeLibraryUrl(item.url) ?? item.url;
    const { ok, status } = await checkUrl(url);
    results.push({ slug: item.slug, url, ok, status });
  }

  const broken = results.filter((r) => !r.ok);

  return NextResponse.json({
    checked: results.length,
    broken: broken.length,
    brokenLinks: broken,
    checkedAt: new Date().toISOString(),
  });
}
