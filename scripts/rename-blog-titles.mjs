/**
 * Rename repetitive blog titles with unique, readable headlines.
 * Slugs stay unchanged so URLs keep working.
 *
 *   node scripts/rename-blog-titles.mjs
 *   node scripts/rename-blog-titles.mjs --dry-run
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, "../src/content/posts.json");
const posts = JSON.parse(readFileSync(postsPath, "utf8"));
const dryRun = process.argv.includes("--dry-run");

const KEEP_SLUGS = new Set([
  "more-than-a-checkup-restoring-smiles-and-confidence",
  "free-eye-checkup-at-sewashram",
]);

const KEEP_TITLE_PATTERNS = [
  /^nutrition basics for village children/i,
  /^how online giving helps fight child hunger/i,
  /^community food drives for children/i,
  /^community meals for children in india/i,
  /^donating computers and devices/i,
  /^give old laptops a second life/i,
  /^how is the lata agrawal foundation/i,
  /^300 lives transformed/i,
  /^empowering change: how lata agrawal foundation/i,
  /^join the movement: help indian kids thrive through volunteer/i,
  /^untangling potential: transforming indian villages through education/i,
  /^food donation & the role of ngos/i,
];

const SMALL_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "vs", "our", "your",
]);

const SLUG_FILLER = new Set([
  "indian", "indias", "india", "kids", "kid", "children", "child", "village", "villages",
  "food", "donation", "donations", "donate", "drive", "drives", "support", "help", "feed",
  "feeding", "hunger", "hungry", "platform", "website", "today", "now", "through", "with",
  "for", "the", "a", "an", "and", "in", "on", "of", "by", "from", "join", "movement", "urgent",
  "call", "ways", "way", "can", "you", "how", "what", "empower", "empowering", "future",
  "community", "communities", "their", "those", "need", "needs", "giving", "back", "make",
  "makes", "success", "successful", "story", "stories", "initiated", "leading", "charge",
  "our", "to", "end", "site", "hope", "into", "at", "is", "are", "was", "be", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "should", "could", "may",
  "might", "must", "shall", "this", "that", "these", "those", "it", "its", "we", "us",
  "your", "my", "me", "i", "he", "she", "they", "them", "who", "which", "when", "where",
  "why", "all", "any", "some", "more", "most", "other", "into", "over", "under", "again",
  "further", "then", "once", "here", "there", "out", "up", "down", "off", "own", "same",
  "so", "than", "too", "very", "just", "also", "only", "new", "old", "first", "last",
  "long", "great", "little", "own", "right", "big", "high", "different", "small", "large",
  "next", "early", "young", "important", "few", "public", "bad", "good", "best", "better",
  "free", "local", "online", "platform", "website",
]);

const BEFORE_AFTER_LINES = [
  "What Changed When Meals Reached the Village",
  "How a Community Drive Transformed Daily Life",
  "Stories and Photos from the Field",
  "Measuring Impact Week by Week",
  "From Empty Plates to Shared Meals",
  "Volunteers Share What They Saw",
];

const FEED_NOW_LINES = [
  "Why Steady Meal Support Matters",
  "Small Donations That Add Up Fast",
  "Neighbors Stepping Up for Families",
  "A Practical Guide for New Donors",
  "When Hunger Hits Close to Home",
  "Building a Reliable Pantry Network",
];

const OPENERS = [
  "Village Nutrition Update",
  "Fighting Child Hunger",
  "Meals That Matter",
  "Community Pantry Story",
  "Food Security Spotlight",
  "Supporting Hungry Families",
  "Rural Nutrition Initiative",
  "School Meal Support",
  "Local Food Drive Report",
  "Hunger Relief in India",
  "Feeding Programs That Work",
  "Children's Nutrition News",
  "Pantry Partners in Wardha",
  "Nutrition on the Ground",
  "A Meal Changes Everything",
  "Village Kitchen Notes",
  "Community Giving Report",
  "Ending Hunger Step by Step",
];

function decodeEntities(text) {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function titleCaseWords(words) {
  return words
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      if (lower === "ngo") return "NGO";
      if (lower === "indias") return "India's";
      if (lower === "vs") return "vs.";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function slugWords(slug) {
  return slug.split("-").filter((w) => w && !/^\d+$/.test(w));
}

function slugHash(slug) {
  return slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function distinctivePhrase(slug, max = 6) {
  const words = slugWords(slug).filter((w) => !SLUG_FILLER.has(w.toLowerCase()));
  if (words.length >= 2) {
    const phrase = titleCaseWords(words.slice(0, max));
    if (phrase.split(" ").length >= 2 && !/^(To|Our|End|Now|Site|Hope|With|In|At)\b/.test(phrase)) {
      return phrase;
    }
  }
  return titleCaseWords(slugWords(slug).slice(-6));
}

function waysTitle(slug) {
  if (/^(\d+)-(\d+)-ways-/.test(slug)) {
    const [, , b] = slug.match(/^(\d+)-(\d+)-ways-/);
    return `${b} Ways to Support Children's Nutrition Programs`;
  }
  if (/^(\d+)-ways-/.test(slug)) {
    const n = slug.match(/^(\d+)-ways-/)[1];
    if (/food|donat|hunger|meal|drive/i.test(slug)) {
      return `${n} Ways Young Volunteers Can Support a Food Drive`;
    }
    return `${n} Ways to Make a Difference in Your Community`;
  }
  return null;
}

function openerFor(slug) {
  return OPENERS[slugHash(slug) % OPENERS.length];
}

function isRepetitiveTitle(title) {
  const t = title.toLowerCase();
  const patterns = [
    /feeding hope/,
    /feed indian (kids|children)/,
    /food donation (drive|platform|site|initiative)/,
    /indian (kids|village|children).*(food|donation|drive|hunger)/,
    /donate food (now|today)/,
    /help feed (hungry )?indian/,
    /support indian (kids|village).*food/,
    /join the (movement|indian kids food)/,
    /urgent call.*food/,
    /from hunger to (hope|happiness)/,
    /before and after.*food/,
    /empower indian (village|youth|kids).*donat/,
    /transforming indian villages.*food/,
    /revolutionizing indian kids/,
    /reinventing the secrets/,
    /revealing indian kids food/,
    /uncovering the secret.*food/,
    /can (indian|you).*food donation/,
    /how (can|to).*food/,
    /how to feed.*(kids|children|indian)/i,
    /feed young minds/i,
    /transforming indian villages/i,
    /\d+\s*ways.*food donation/,
    /feed (the )?future.*food/,
    /feeding (dreams|the villages|indias future)/,
  ];
  return patterns.some((p) => p.test(t));
}

function shouldRename(post) {
  if (KEEP_SLUGS.has(post.slug)) return false;
  const title = decodeEntities(post.title);
  if (KEEP_TITLE_PATTERNS.some((p) => p.test(title))) return false;
  return isRepetitiveTitle(title) || /food donation drive|feeding hope:|feed indian kids/i.test(title);
}

function buildTitle(slug) {
  const ways = waysTitle(slug);
  if (ways) return ways;

  if (slug.startsWith("how-to-feed-")) {
    return "How to Feed Children Through Our Online Giving Platform";
  }

  if (slug.startsWith("how-to-organize-")) {
    return "How to Organize a Successful Children's Food Drive";
  }

  if (slug.startsWith("how-to-start-an-")) {
    return "How to Start a Neighborhood Food Donation Initiative";
  }

  if (slug.startsWith("how-to-support-indian-kids")) {
    return "How to Support Children's Nutrition Programs Locally";
  }

  if (slug.startsWith("before-and-after-")) {
    const line = BEFORE_AFTER_LINES[slugHash(slug) % BEFORE_AFTER_LINES.length];
    return `Before and After: ${line}`;
  }

  if (slug.startsWith("how-to-")) {
    const tail = slug.replace(/^how-to-/, "");
    return `How to ${titleCaseWords(slugWords(tail))}`;
  }

  if (slug === "how-can-indian-children-benefit-from-a-food-donation-drive") {
    return "How Nutrition Programs Help Children in Rural India";
  }

  if (slug === "help-fight-hunger-in-india-feed-indian-kids-today") {
    return "Fighting Hunger Across India: What Supporters Can Do Today";
  }

  if (slug.startsWith("how-can-")) {
    return `How Can ${titleCaseWords(slugWords(slug.replace(/^how-can-/, "")))}?`;
  }

  if (slug.startsWith("from-hunger-to-")) {
    const mood = slug.replace(/^from-hunger-to-/, "").split("-")[0];
    return `From Hunger to ${titleCaseWords([mood])}: Stories from the Field`;
  }

  if (slug.includes("chef") && slug.includes("sunita")) {
    return "Chef Sunita Partners on a Neighborhood Food Drive";
  }

  if (slug.includes("curry-for-a-cause") || slug.includes("kibble-kitchen")) {
    return "Curry for a Cause: The Kibble Kitchen Project";
  }

  if (slug.includes("5-year-old")) {
    return "A 5-Year-Old Starts a Neighborhood Food Collection";
  }

  if (slug.includes("10000-clothing")) {
    return "10,000 Clothing Donations for Village Families";
  }

  if (slug.includes("controversial-call") && slug.includes("computers")) {
    return "Why Donating Computers Matters for Rural Students";
  }

  if (slug.includes("book") && !slug.includes("facebook")) {
    return titleCaseWords(slugWords(slug));
  }

  if (slug.includes("computer") || slug.includes("laptop")) {
    return titleCaseWords(slugWords(slug));
  }

  if (slug.includes("generosity") && slug.includes("tradition")) {
    return "Generosity vs. Tradition in Village Food Sharing";
  }

  if (slug.includes("debate")) {
    return "Community Debate: Who Should Lead Village Food Programs?";
  }

  if (slug.includes("delight")) {
    return "When a Village Food Drive Delights the Community";
  }

  if (/donate-food-now|feed-indian-kids-donate|urgent-call.*donate-food/i.test(slug)) {
    const line = FEED_NOW_LINES[slugHash(slug) % FEED_NOW_LINES.length];
    return `${openerFor(slug)}: ${line}`;
  }

  if (/food-donation-drive|food-drive|food-donation/i.test(slug)) {
    const line = FEED_NOW_LINES[slugHash(slug) % FEED_NOW_LINES.length];
    return `${openerFor(slug)}: ${line}`;
  }

  return `${openerFor(slug)}: ${distinctivePhrase(slug, 5)}`;
}

function makeUniqueTitle(base, used) {
  let candidate = base.replace(/\s+/g, " ").replace(/\s+:/g, ":").trim();
  if (!used.has(candidate.toLowerCase())) {
    used.add(candidate.toLowerCase());
    return candidate;
  }

  let n = 2;
  while (used.has(`${candidate} (${n})`.toLowerCase())) n++;
  candidate = `${candidate} (${n})`;
  used.add(candidate.toLowerCase());
  return candidate;
}

const usedTitles = new Set(
  posts.filter((p) => !shouldRename(p)).map((p) => decodeEntities(p.title).toLowerCase())
);

const changes = [];

for (const post of posts) {
  if (!shouldRename(post)) continue;

  const oldTitle = decodeEntities(post.title);
  const newTitle = makeUniqueTitle(buildTitle(post.slug), usedTitles);

  if (oldTitle !== newTitle) {
    changes.push({ slug: post.slug, oldTitle, newTitle });
    post.title = newTitle;
  }
}

console.log(`Renamed ${changes.length} of ${posts.length} posts\n`);

for (const { slug, newTitle } of changes) {
  console.log(`• ${newTitle}`);
  console.log(`  /blog/${slug}\n`);
}

const titles = posts.map((p) => p.title.toLowerCase());
console.log(`Unique titles: ${new Set(titles).size}/${posts.length}`);

if (dryRun) {
  console.log("\n(dry run — no file written)");
  process.exit(0);
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(`\nWrote ${postsPath}`);
