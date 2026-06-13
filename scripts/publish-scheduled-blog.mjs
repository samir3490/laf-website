/**
 * Move scheduled blog posts whose date <= today into posts.json.
 * Used by GitHub Actions weekly publish workflow.
 *
 *   node scripts/publish-scheduled-blog.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scheduledPath = join(__dirname, "../src/content/scheduled-posts.json");
const postsPath = join(__dirname, "../src/content/posts.json");

const today = new Date().toISOString().slice(0, 10);
console.log(`Publish check — today is ${today}`);

if (!existsSync(scheduledPath)) {
  console.log("No scheduled-posts.json found.");
  process.exit(0);
}

const scheduled = JSON.parse(readFileSync(scheduledPath, "utf8"));
const posts = JSON.parse(readFileSync(postsPath, "utf8"));

if (!Array.isArray(scheduled) || scheduled.length === 0) {
  console.log("No scheduled posts.");
  process.exit(0);
}

const toPublish = [];
const toKeep = [];

for (const item of scheduled) {
  if (typeof item.date === "string" && item.date <= today) {
    toPublish.push(item);
    console.log(`Publishing: ${item.title} (${item.date})`);
  } else {
    toKeep.push(item);
  }
}

if (toPublish.length === 0) {
  console.log("Nothing due today.");
  process.exit(0);
}

for (const item of toPublish) {
  const slug = item.slug;
  if (posts.some((p) => p.slug === slug)) {
    console.warn(`Skip duplicate slug: ${slug}`);
    continue;
  }
  posts.unshift({
    id: item.id ?? randomUUID(),
    slug,
    title: item.title,
    excerpt: item.excerpt ?? "",
    html: item.html,
    date: item.date.includes("T") ? item.date : `${item.date}T09:00:00+05:30`,
    link: item.link ?? `/blog/${slug}`,
    featuredImage: item.featuredImage ?? null,
  });
}

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
writeFileSync(scheduledPath, JSON.stringify(toKeep, null, 2) + "\n", "utf8");

console.log(`Published ${toPublish.length} post(s). ${toKeep.length} remain scheduled.`);
