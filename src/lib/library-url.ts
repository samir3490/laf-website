export function normalizeLibraryUrl(raw: string): string | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname.endsWith("/") && parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    parsed.search = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function slugFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").replace(/\./g, "-");
    const path = parsed.pathname
      .replace(/\/$/, "")
      .replace(/^\//, "")
      .replace(/\//g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");
    const slug = path ? `${host}-${path}` : host;
    return slug.slice(0, 80) || "resource";
  } catch {
    return "resource";
  }
}

export type PageMetadata = {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
  textSnippet: string;
};

function metaContent(html: string, attr: string, key: string): string {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`,
    "i"
  );
  const match = html.match(re);
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

function titleTag(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchPageMetadata(rawUrl: string): Promise<PageMetadata | null> {
  const url = normalizeLibraryUrl(rawUrl);
  if (!url) return null;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "LAF-Library-Bot/1.0 (+https://www.agrawalfoundation.org/library)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });

  if (!res.ok) return null;

  const html = (await res.text()).slice(0, 500_000);
  const title =
    metaContent(html, "property", "og:title") ||
    metaContent(html, "name", "twitter:title") ||
    titleTag(html);
  const description =
    metaContent(html, "property", "og:description") ||
    metaContent(html, "name", "description") ||
    metaContent(html, "name", "twitter:description") ||
    "";
  const ogImage =
    metaContent(html, "property", "og:image") ||
    metaContent(html, "name", "twitter:image") ||
    "";

  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }

  const favicon = host
    ? `https://www.google.com/s2/favicons?domain=${host}&sz=128`
    : "/logo-square.png";

  return {
    url,
    title: title || host || url,
    description: description || stripHtml(html).slice(0, 280),
    ogImage,
    favicon,
    textSnippet: stripHtml(html).slice(0, 2000),
  };
}
