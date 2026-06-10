import type { MetadataRoute } from "next";
import { getAllPosts, getSite } from "@/lib/content";
import { getSeedLibraryResources } from "@/lib/library-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/about",
    "/donate",
    "/contact",
    "/volunteer",
    "/csr",
    "/faq",
    "/blog",
    "/library",
    "/library/submit",
    "/library/robotics",
    "/library/scholarships",
    "/library/volunteer-training",
    "/ways-to-help",
    "/community-scratch-games",
    "/privacy-policy",
    "/terms-conditions",
  ];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const libraryResources: MetadataRoute.Sitemap = getSeedLibraryResources().map((r) => ({
    url: `${base}/library/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...libraryResources, ...posts];
}
