import {
  getAllPosts,
  getPostFeaturedImage,
  getSite,
  stripHtml,
  type WpPost,
} from "@/lib/content";
import { RSS_FEED_PATH, siteUrl } from "@/lib/seo";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 pubDate (RFC 822). */
export function toRfc822Date(date: string): string {
  return new Date(date).toUTCString();
}

function itemXml(post: WpPost): string {
  const url = siteUrl(`/blog/${post.slug}`);
  const description = stripHtml(post.excerpt).slice(0, 500);
  const image = siteUrl(getPostFeaturedImage(post));
  const lines = [
    `    <item>`,
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    `      <pubDate>${toRfc822Date(post.date)}</pubDate>`,
    `      <description>${escapeXml(description)}</description>`,
    `      <enclosure url="${escapeXml(image)}" type="image/jpeg" />`,
    `    </item>`,
  ];
  return lines.join("\n");
}

export function buildBlogRssXml(posts: WpPost[] = getAllPosts()): string {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const site = getSite();
  const feedUrl = siteUrl(RSS_FEED_PATH);
  const blogUrl = siteUrl("/blog");
  const lastBuildDate = sorted[0]
    ? toRfc822Date(sorted[0].date)
    : new Date().toUTCString();
  const title = `${site.name} Blog`;
  const description =
    "Stories, news, and insights on children's education, volunteering, and community impact from the Lata Agrawal Foundation in Wardha, India.";

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(blogUrl)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>en-in</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...sorted.map(itemXml),
    `  </channel>`,
    `</rss>`,
    ``,
  ].join("\n");
}
