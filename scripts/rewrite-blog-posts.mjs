/**
 * Rewrite blog posts: unique titles, slugs matching titles, topic hero images,
 * unique inline images, and SEO redirects from old URLs.
 *
 *   node scripts/rewrite-blog-posts.mjs
 *   node scripts/rewrite-blog-posts.mjs --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARTICLE_VARIANTS,
  PRESERVE_SLUGS,
  TOPIC_META,
  pickTopic,
} from "./blog-post-templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const postsPath = join(root, "src/content/posts.json");
const redirectsPath = join(root, "src/content/blog-redirects.json");
const blogImgDir = join(root, "public/images/blog");
const dryRun = process.argv.includes("--dry-run");

const SITE = "https://agrawalfoundation.org";
const LAF = "Lata Agrawal Foundation";

/** One custom AI hero image per topic (8 total — not 87). */
const TOPIC_HEROES = {
  education: "/images/blog/heroes/education-hero.png",
  career: "/images/blog/heroes/career-hero.png",
  "digital-literacy": "/images/blog/heroes/digital-literacy-hero.png",
  "women-empowerment": "/images/blog/heroes/women-empowerment-hero.png",
  "medical-checkups": "/images/blog/heroes/medical-checkups-hero.png",
  "food-donation": "/images/blog/heroes/food-donation-hero.png",
  volunteering: "/images/blog/heroes/volunteering-hero.png",
  community: "/images/blog/heroes/community-hero.png",
};

const SLUG_FILLER = new Set([
  "indian", "indias", "india", "kids", "kid", "children", "child", "village", "villages",
  "food", "donation", "donations", "donate", "drive", "drives", "support", "help", "feed",
  "feeding", "hunger", "hungry", "platform", "website", "today", "now", "through", "with",
  "for", "the", "a", "an", "and", "in", "on", "of", "by", "from", "join", "movement", "urgent",
  "call", "ways", "way", "can", "you", "how", "what", "empower", "empowering", "future",
  "community", "communities", "our", "their", "those", "need", "needs", "giving", "back",
  "make", "makes", "success", "story", "stories", "young", "village", "indian", "laf",
]);

const SEO_FOOTER = `
<div class="laf-seo-footer laf-blog-footer">
<p><strong>Support the Lata Agrawal Foundation</strong> — an NGO in Wardha, Maharashtra working for children's education, nutrition, and wellbeing across India.</p>
<ul>
<li><a href="/donate">Donate to support children&apos;s education</a></li>
<li><a href="/volunteer">Volunteer with LAF in Wardha and online</a></li>
<li><a href="/library">Explore our free learning resource library</a></li>
<li><a href="/events/drawing-competition">Join the LAF Drawing Competition (15–30 June 2026)</a></li>
<li><a href="/about">About our mission and impact</a></li>
<li><a href="/contact">Contact us in Wardha</a></li>
</ul>
</div>`;

const EXTRA_IMAGES = [
  "/images/2024/12/homebannerngo-1024x585.webp",
  "/images/2024/12/mission-ngo-lata.webp",
];

function loadInlineImagePool() {
  const imgs = [];
  if (existsSync(blogImgDir)) {
    for (const f of readdirSync(blogImgDir)) {
      if (/\.(jpe?g|png|webp|gif)$/i.test(f)) imgs.push(`/images/blog/${f}`);
    }
  }
  imgs.sort();
  return imgs.length ? imgs : EXTRA_IMAGES;
}

function slugify(title) {
  return title
    .replace(/&[^;]+;/g, " ")
    .replace(/['']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function capitalize(w) {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function slugAngle(slug) {
  const words = slug.split("-").filter((w) => w.length > 2 && !SLUG_FILLER.has(w.toLowerCase()));
  if (words.length < 2) return null;
  return words.slice(0, 5).map(capitalize).join(" ");
}

function makeUniqueTitle(baseTitle, oldSlug, usedTitles) {
  let title = baseTitle;
  if (!usedTitles.has(title.toLowerCase())) {
    usedTitles.add(title.toLowerCase());
    return title;
  }
  const angle = slugAngle(oldSlug);
  if (angle) {
    title = `${baseTitle}: ${angle}`;
  } else {
    title = `${baseTitle} in Wardha`;
  }
  let n = 2;
  while (usedTitles.has(title.toLowerCase())) {
    title = angle ? `${baseTitle}: ${angle} (${n})` : `${baseTitle} (${n})`;
    n++;
  }
  usedTitles.add(title.toLowerCase());
  return title;
}

function makeUniqueSlug(title, usedSlugs) {
  let slug = slugify(title);
  if (!slug) slug = "laf-impact-story";
  let n = 2;
  let candidate = slug;
  while (usedSlugs.has(candidate)) {
    candidate = `${slug}-${n}`;
    n++;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function assignInlineImages(index, pool) {
  if (pool.length === 0) return [null, null];
  const a = pool[index % pool.length];
  let b = pool[(index + Math.floor(pool.length / 2)) % pool.length];
  if (b === a && pool.length > 1) {
    b = pool[(index + Math.floor(pool.length / 3) + 1) % pool.length];
  }
  return [a, b];
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fill(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function imgTag(src, alt) {
  if (!src) return "";
  return `<figure class="wp-block-image size-large"><img src="${src}" alt="${alt}" class="laf-post-img wp-image" width="1024" height="683" loading="lazy" decoding="async" /></figure>`;
}

function buildArticleHtml({ title, intro, sections, resources, hero, inlineImages, imageAlt, postUrl, topicLabel }) {
  const vars = { laf: LAF, url: postUrl, topic: topicLabel };
  const parts = [];

  parts.push(imgTag(hero, `${imageAlt} — ${title}`));
  parts.push(`<p class="wp-block-paragraph">${fill(intro, vars)}</p>`);
  parts.push(
    `<p class="wp-block-paragraph"><em>Published by the ${LAF} in Wardha, Maharashtra. Read more at <a href="${postUrl}">${postUrl}</a>.</em></p>`
  );

  sections.forEach((sec, i) => {
    parts.push(`<h2 class="wp-block-heading">${fill(sec.heading, vars)}</h2>`);
    sec.paragraphs.forEach((p) => {
      parts.push(`<p class="wp-block-paragraph">${fill(p, vars)}</p>`);
    });
    if (i === 0 && inlineImages[0]) {
      parts.push(imgTag(inlineImages[0], `${imageAlt} — ${fill(sec.heading, vars)}`));
    }
  });

  parts.push(`<h2 class="wp-block-heading">Trusted resources</h2>`);
  parts.push("<ul class=\"wp-block-list\">");
  for (const r of resources) {
    const external = r.href.startsWith("http");
    parts.push(
      `<li><a href="${r.href}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${r.label}</a></li>`
    );
  }
  parts.push("</ul>");

  if (inlineImages[1]) {
    parts.push(imgTag(inlineImages[1], `${LAF} community program in Wardha — ${title}`));
  }

  parts.push(`<h2 class="wp-block-heading">Support ${LAF}</h2>`);
  parts.push(
    `<p class="wp-block-paragraph">We aim to bridge the education gap by providing essential resources, mentorship, and opportunities. <a href="/donate">Donate</a>, <a href="/volunteer">volunteer</a>, or visit our <a href="/library">free learning library</a>. Questions? <a href="/contact">Contact us in Wardha</a>.</p>`
  );

  parts.push(SEO_FOOTER);
  return parts.join("\n\n");
}

function enhancePreservedPost(post, postUrl) {
  let html = post.html;
  if (!html.includes("laf-seo-footer")) {
    html = `${html.trim()}\n${SEO_FOOTER}\n`;
  }
  html = html.replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/blog\/[^/"']+\/?/g, postUrl);
  if (!html.includes(postUrl)) {
    const note = `<p class="wp-block-paragraph"><em>Originally published at <a href="${postUrl}">${postUrl}</a>.</em></p>`;
    html = html.replace(SEO_FOOTER, `${note}\n${SEO_FOOTER}`);
  }
  return html;
}

function introPlain(intro) {
  return intro.replace(/\{laf\}/g, LAF);
}

const posts = JSON.parse(readFileSync(postsPath, "utf8"));
const inlinePool = loadInlineImagePool();
const usedTitles = new Set();
const usedSlugs = new Set();
const redirects = {};
const topicVariantIndex = {};

let rewritten = 0;
let preserved = 0;

for (let index = 0; index < posts.length; index++) {
  const post = posts[index];
  const oldSlug = post.slug;

  if (PRESERVE_SLUGS.has(oldSlug)) {
    const newSlug = makeUniqueSlug(post.title, usedSlugs);
    const postUrl = `${SITE}/blog/${newSlug}/`;
    if (oldSlug !== newSlug) redirects[oldSlug] = newSlug;
    post.slug = newSlug;
    post.link = postUrl;
    post.html = enhancePreservedPost(post, postUrl);
    if (!post.featuredImage?.includes("2026/03")) {
      post.featuredImage = TOPIC_HEROES["medical-checkups"];
    }
    if (!post.excerpt || post.excerpt.length < 40) {
      post.excerpt = stripHtml(post.html).slice(0, 320);
    }
    preserved++;
    continue;
  }

  const topic = pickTopic(index, oldSlug);
  const meta = TOPIC_META[topic];
  const variants = ARTICLE_VARIANTS[topic] ?? ARTICLE_VARIANTS.community;
  topicVariantIndex[topic] = topicVariantIndex[topic] ?? 0;
  const variant = variants[topicVariantIndex[topic] % variants.length];
  topicVariantIndex[topic]++;

  const title = makeUniqueTitle(variant.title, oldSlug, usedTitles);
  const newSlug = makeUniqueSlug(title, usedSlugs);
  const postUrl = `${SITE}/blog/${newSlug}/`;
  const hero = TOPIC_HEROES[topic] ?? TOPIC_HEROES.community;
  const inlineImages = assignInlineImages(index, inlinePool);

  if (oldSlug !== newSlug) redirects[oldSlug] = newSlug;

  post.title = title;
  post.slug = newSlug;
  post.link = postUrl;
  post.html = buildArticleHtml({
    title,
    intro: variant.intro,
    sections: variant.sections,
    resources: meta.resources,
    hero,
    inlineImages,
    imageAlt: meta.imageAlt,
    postUrl,
    topicLabel: meta.label,
  });
  post.excerpt = stripHtml(`${introPlain(variant.intro)} ${variant.sections[0]?.paragraphs[0] ?? ""}`).slice(0, 320);
  post.featuredImage = hero;
  rewritten++;
}

console.log(`Rewrote ${rewritten} posts, preserved ${preserved} real stories (${posts.length} total)`);
console.log(`Unique titles: ${usedTitles.size + preserved}, unique slugs: ${usedSlugs.size}`);
console.log(`301 redirects: ${Object.keys(redirects).length}`);
console.log(`Inline image pool: ${inlinePool.length} photos`);

if (dryRun) {
  console.log("\nSample slug → title:");
  posts.slice(0, 6).forEach((p) => console.log(`  /blog/${p.slug}\n    ${p.title}\n`));
  console.log("(dry run — no files written)");
  process.exit(0);
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2) + "\n", "utf8");
console.log(`Wrote ${postsPath}`);
console.log(`Wrote ${redirectsPath}`);
