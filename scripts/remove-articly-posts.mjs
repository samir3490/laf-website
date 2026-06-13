/**
 * Remove Articly AI duplicate blog posts from posts.json.
 * Keeps real WordPress stories (wp-block, no Articly template shell).
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

/** Always keep these slugs even if detection heuristics change. */
const FORCE_KEEP = new Set([
  "more-than-a-checkup-restoring-smiles-and-confidence",
  "free-eye-checkup-at-sewashram",
]);

function isArticlyTemplate(html) {
  return (
    /class=['"]post_open['"]/.test(html) ||
    /class=['"]post_toc_list['"]/.test(html) ||
    /post_section_\d/.test(html) ||
    /articly\.ai/i.test(html)
  );
}

function isRealLafStory(post) {
  if (FORCE_KEEP.has(post.slug)) return true;
  const html = post.html ?? "";
  if (isArticlyTemplate(html)) return false;
  if (/wp-block|wp-image|Sewashram|Wardha/i.test(html)) return true;
  return false;
}

const kept = posts.filter(isRealLafStory);
const removed = posts.filter((p) => !isRealLafStory(p));

console.log(`Total: ${posts.length} → keep ${kept.length}, remove ${removed.length}`);

if (removed.length > 0) {
  console.log("\nRemoved slugs:");
  for (const p of removed) {
    console.log(`  - ${p.slug}`);
  }
}

console.log("\nKept:");
for (const p of kept) {
  console.log(`  + ${p.slug} — ${p.title}`);
}

if (dryRun) {
  console.log("\n(dry run — no file written)");
  process.exit(0);
}

writeFileSync(postsPath, JSON.stringify(kept, null, 2) + "\n", "utf8");
console.log(`\nWrote ${kept.length} posts → ${postsPath}`);
