import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import posts from "@/content/posts.json";
import blogRedirects from "@/content/blog-redirects.json";

const POST_SLUGS = new Set(posts.map((p) => p.slug));
const REDIRECTS = blogRedirects as Record<string, string>;

/** Paths served by the App Router — do not treat as legacy blog URLs. */
const RESERVED = new Set([
  "about",
  "donate",
  "contact",
  "volunteer",
  "csr",
  "faq",
  "blog",
  "ways-to-help",
  "events",
  "drawing-competition",
  "community-scratch-games",
  "privacy-policy",
  "terms-conditions",
  "library",
  "gallery",
  "reviews",
  "admin",
  "scratch-games",
]);

function redirectBlog(request: NextRequest, newSlug: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/blog/${newSlug}`;
  return NextResponse.redirect(url, 301);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 2 && segments[0] === "blog") {
    const target = REDIRECTS[segments[1]];
    if (target) return redirectBlog(request, target);
    return NextResponse.next();
  }

  if (segments.length !== 1) return NextResponse.next();

  const slug = segments[0];

  if (REDIRECTS[slug]) {
    return redirectBlog(request, REDIRECTS[slug]);
  }

  if (RESERVED.has(slug) || !POST_SLUGS.has(slug)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/blog/${slug}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.png|logo-square.png|robots.txt|sitemap.xml).*)"],
};
