import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const posts = JSON.parse(readFileSync(join(root, "src/content/posts.json"), "utf8"));
const pages = JSON.parse(readFileSync(join(root, "src/content/pages.json"), "utf8"));
const home = JSON.parse(readFileSync(join(root, "src/content/home.json"), "utf8"));
const ways = JSON.parse(readFileSync(join(root, "src/content/ways-to-help.json"), "utf8"));

const seen = new Set();
const items = [];

function add(src, title, category, alt = "") {
  if (!src || !src.startsWith("/images/") || seen.has(src)) return;
  seen.add(src);
  items.push({ src, title, category, alt: alt || title });
}

for (const src of pages["home-2"]?.images ?? []) {
  add(src, "Foundation programs", "Community");
}

for (const src of pages["ways-to-help"]?.images ?? []) {
  add(src, "Ways to help", "Community");
}

add(home.hero.image, "Our mission in action", "Community");
add(home.hero.backgroundImage, "Education for every child", "Education");
for (const block of home.impact) {
  add(block.image, block.title, "Impact");
}

for (const block of ways.ways ?? ways.sections ?? ways.items ?? []) {
  if (block.image) add(block.image, block.title ?? "Ways to help", "Community");
}

for (const post of posts) {
  if (!post.featuredImage?.startsWith("/images/")) continue;
  const isEvent =
    /dental|camp|wardha|sewashram|event|drive|volunteer|school/i.test(
      `${post.title} ${post.excerpt ?? ""}`
    ) || post.featuredImage.includes("/2026/");
  if (isEvent) {
    add(post.featuredImage, post.title.slice(0, 80), "Events");
  }
}

const out = {
  intro:
    "Moments from our education programs, food drives, health camps, and volunteer work across India.",
  categories: ["All", "Community", "Education", "Impact", "Events"],
  images: items.slice(0, 36),
};

writeFileSync(join(root, "src/content/gallery.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${items.length} gallery images to src/content/gallery.json`);
