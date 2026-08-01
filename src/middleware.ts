import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import posts from "@/content/posts.json";

const POST_SLUGS = new Set(posts.map((p) => p.slug));

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
  "how-we-help",
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
  if (segments.length !== 1) return NextResponse.next();

  const slug = segments[0];
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
