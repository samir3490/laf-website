/**
 * Remove duplicate blog posts from posts.json (same title or identical body).
 * Does NOT remove all Articly-formatted posts — only exact/near-exact duplicates.
 *
 *   node scripts/remove-articly-posts.mjs
 *   node scripts/remove-articly-posts.mjs --dry-run
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, "../src/content/posts.json");
const posts = JSON.parse(readFileSync(postsPath, "utf8"));
const dryRun = process.argv.includes("--dry-run");

function normalizeTitle(title) {
  return (title ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function contentFingerprint(html) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Prefer base slug (no -2 suffix) and earlier publish date when picking which copy to keep. */
function pickKeeper(candidates) {
  return [...candidates].sort((a, b) => {
    const aBase = !/-\d+$/.test(a.slug);
    const bBase = !/-\d+$/.test(b.slug);
    if (aBase !== bBase) return aBase ? -1 : 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  })[0];
}

const removeSlugs = new Set();

function markDuplicates(groups, label) {
  for (const group of groups) {
    if (group.length < 2) continue;
    const keeper = pickKeeper(group);
    for (const post of group) {
      if (post.slug !== keeper.slug) {
        removeSlugs.add(post.slug);
      }
    }
    console.log(
      `${label}: keep "${keeper.slug}" — remove ${group.length - 1} duplicate(s)`
    );
  }
}

const byTitle = new Map();
for (const post of posts) {
  const key = normalizeTitle(post.title);
  if (!byTitle.has(key)) byTitle.set(key, []);
  byTitle.get(key).push(post);
}
markDuplicates(byTitle.values(), "Same title");

const byContent = new Map();
for (const post of posts) {
  if (removeSlugs.has(post.slug)) continue;
  const key = contentFingerprint(post.html);
  if (!key) continue;
  if (!byContent.has(key)) byContent.set(key, []);
  byContent.get(key).push(post);
}
markDuplicates(byContent.values(), "Same content");

const kept = posts.filter((p) => !removeSlugs.has(p.slug));
const removed = posts.filter((p) => removeSlugs.has(p.slug));

console.log(`\nTotal: ${posts.length} → keep ${kept.length}, remove ${removed.length}`);

if (removed.length > 0) {
  console.log("\nRemoved slugs:");
  for (const p of removed) {
    console.log(`  - ${p.slug}`);
  }
}

if (dryRun) {
  console.log("\n(dry run — no file written)");
  process.exit(0);
}

if (removed.length === 0) {
  console.log("\nNo duplicates found — posts.json unchanged.");
  process.exit(0);
}

writeFileSync(postsPath, JSON.stringify(kept, null, 2) + "\n", "utf8");
console.log(`\nWrote ${kept.length} posts → ${postsPath}`);
