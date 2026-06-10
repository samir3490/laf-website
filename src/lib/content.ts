import site from "@/content/site.json";
import pages from "@/content/pages.json";
import posts from "@/content/posts.json";

export type SiteConfig = typeof site;
export type WpPage = (typeof pages)[keyof typeof pages];
export type WpPost = (typeof posts)[number];

export function getSite(): SiteConfig {
  return site;
}

export function getPage(slug: string): WpPage | undefined {
  return (pages as Record<string, WpPage>)[slug];
}

export function getAllPosts(): WpPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPost(slug: string): WpPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
