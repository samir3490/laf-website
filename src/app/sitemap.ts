import type { MetadataRoute } from "next";
import { getAllPosts, getSite } from "@/lib/content";

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

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...posts];
}
