import type { MetadataRoute } from "next";
import { getAllPosts, getSite } from "@/lib/content";
import { getSeedLibraryResources } from "@/lib/library-data";
import { getLearningPaths } from "@/lib/library-paths";

const ROUTE_PRIORITY: Record<string, number> = {
  "": 1,
  "/donate": 0.9,
  "/volunteer": 0.9,
  "/library": 0.85,
  "/about": 0.85,
  "/ways-to-help": 0.8,
  "/contact": 0.75,
  "/events": 0.75,
  "/blog": 0.7,
  "/events/drawing-competition": 0.7,
  "/events/drawing-competition/submit": 0.65,
  "/events/scratch-games": 0.65,
  "/library/submit": 0.65,
  "/library/robotics": 0.65,
  "/library/scholarships": 0.65,
  "/library/paths": 0.65,
  "/gallery": 0.55,
  "/faq": 0.55,
  "/csr": 0.5,
  "/library/contributors": 0.45,
  "/library/ngo": 0.45,
  "/library/volunteer-training": 0.45,
  "/privacy-policy": 0.3,
  "/terms-conditions": 0.3,
};

function routePriority(path: string): number {
  return ROUTE_PRIORITY[path] ?? 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/about",
    "/gallery",
    "/reviews",
    "/donate",
    "/contact",
    "/volunteer",
    "/csr",
    "/faq",
    "/blog",
    "/library",
    "/library/submit",
    "/events",
    "/events/drawing-competition",
    "/events/drawing-competition/submit",
    "/events/scratch-games",
    "/library/robotics",
    "/library/scholarships",
    "/library/volunteer-training",
    "/library/ngo",
    "/library/paths",
    "/library/contributors",
    "/ways-to-help",
    "/privacy-policy",
    "/terms-conditions",
  ];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" || path === "/library" ? "weekly" : "monthly",
    priority: routePriority(path),
  }));

  const libraryResources: MetadataRoute.Sitemap = getSeedLibraryResources().map((r) => ({
    url: `${base}/library/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const learningPaths: MetadataRoute.Sitemap = getLearningPaths().map((p) => ({
    url: `${base}/library/paths/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.62,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...libraryResources, ...learningPaths, ...posts];
}
