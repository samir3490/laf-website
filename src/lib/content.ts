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
    .replace(/<meta[^>]*>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html)
    .replace(/<a[^>]*articly\.ai[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/style=['"]position:\s*absolute[^'"]*['"]/gi, "")
    .replace(/class=['']post_imgs['']/gi, 'class="laf-post-img"');
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
