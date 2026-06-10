import site from "@/content/site.json";
import pages from "@/content/pages.json";
import posts from "@/content/posts.json";

export type SiteConfig = typeof site;
export type WpPage = (typeof pages)[keyof typeof pages];
export type WpPost = (typeof posts)[number] & { featuredImage?: string | null };

const BLOG_FALLBACK_IMAGE = "/images/2024/12/homebannerngo-1024x585.webp";

export function getPostFeaturedImage(post: WpPost): string {
  if (post.featuredImage) return post.featuredImage;
  const match = post.html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return match?.[1] ?? BLOG_FALLBACK_IMAGE;
}

/** Omit the hero image from body HTML when it duplicates the featured image. */
export function getPostBodyHtml(post: WpPost): string {
  const featured = getPostFeaturedImage(post);
  let removed = false;
  return post.html.replace(/<p>\s*<img[^>]+>\s*<\/p>/i, (match) => {
    if (removed) return match;
    if (match.includes(featured) || /post_imgs|laf-post-img/.test(match)) {
      removed = true;
      return "";
    }
    return match;
  });
}

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
    .replace(/<p>\s*<meta[^>]*>\s*<\/p>/gi, "")
    .replace(/<a[^>]*articly\.ai[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/style=['"]position:\s*absolute[^'"]*['"]/gi, "")
    .replace(/class=['']post_imgs['']/gi, 'class="laf-post-img"')
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/donate-now\/?/gi, "/donate")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/become-a-volunteer\/?/gi, "/volunteer")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/contact-us\/?/gi, "/contact")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/?/gi, "/");
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
