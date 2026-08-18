import { buildBlogRssXml } from "@/lib/rss";

/** Revalidate hourly so scheduled posts appear in the feed after publish time. */
export const revalidate = 3600;

export function GET() {
  const xml = buildBlogRssXml();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
