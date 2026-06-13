/**
 * Rewrite all blog posts with original NGO-focused content.
 * Preserves: id, slug, date, link, featuredMedia (if set).
 * Updates: title, excerpt, html, featuredImage.
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
const blogImgDir = join(root, "public/images/blog");
const dryRun = process.argv.includes("--dry-run");

const SITE = "https://agrawalfoundation.org";
const LAF = "Lata Agrawal Foundation";

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
  "/images/2026/03/1000518338-1024x683.png",
];

function loadBlogImages() {
  const imgs = [];
  if (existsSync(blogImgDir)) {
    for (const f of readdirSync(blogImgDir)) {
      if (/\.(jpe?g|png|webp|gif)$/i.test(f)) imgs.push(`/images/blog/${f}`);
    }
  }
  imgs.sort();
  return imgs.length ? imgs : EXTRA_IMAGES;
}

function hash(s) {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function pickImages(slug, count, pool) {
  const start = hash(slug) % pool.length;
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i * 7) % pool.length]);
  return out;
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
  return `<figure class="wp-block-image size-large"><img src="${src}" alt="${alt}" class="laf-post-img wp-image" width="1024" height="683" loading="lazy" decoding="async" /></figure>`;
}

function uniqueTitle(base, used, post) {
  let t = base;
  if (used.has(t.toLowerCase())) {
    const d = new Date(post.date);
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
    t = `${base} — ${label}`;
  }
  let n = 2;
  while (used.has(t.toLowerCase())) {
    t = `${base} (${n})`;
    n++;
  }
  used.add(t.toLowerCase());
  return t;
}

function buildArticleHtml({ title, intro, sections, resources, images, imageAlt, postUrl, topicLabel }) {
  const vars = { laf: LAF, url: postUrl, topic: topicLabel };
  const parts = [];

  parts.push(imgTag(images[0], `${imageAlt} — ${title}`));
  parts.push(`<p class="wp-block-paragraph">${fill(intro, vars)}</p>`);
  parts.push(
    `<p class="wp-block-paragraph"><em>Published by the ${LAF} in Wardha, Maharashtra. Read more at <a href="${postUrl}">${postUrl}</a>.</em></p>`
  );

  sections.forEach((sec, i) => {
    parts.push(`<h2 class="wp-block-heading">${fill(sec.heading, vars)}</h2>`);
    sec.paragraphs.forEach((p) => {
      parts.push(`<p class="wp-block-paragraph">${fill(p, vars)}</p>`);
    });
    if (i === 0 && images[1]) {
      parts.push(imgTag(images[1], `${imageAlt} — ${fill(sec.heading, vars)}`));
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

  if (images[2]) {
    parts.push(imgTag(images[2], `${LAF} community program in Wardha`));
  }

  parts.push(`<h2 class="wp-block-heading">Support ${LAF}</h2>`);
  parts.push(
    `<p class="wp-block-paragraph">We aim to bridge the education gap by providing essential resources, mentorship, and opportunities. <a href="/donate">Donate</a>, <a href="/volunteer">volunteer</a>, or visit our <a href="/library">free learning library</a>. Questions? <a href="/contact">Contact us in Wardha</a>.</p>`
  );

  parts.push(SEO_FOOTER);
  return parts.join("\n\n");
}

function enhancePreservedPost(post) {
  let html = post.html;
  const postUrl = `${SITE}/blog/${post.slug}/`;
  if (!html.includes("laf-seo-footer")) {
    html = `${html.trim()}\n${SEO_FOOTER}\n`;
  }
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
const imagePool = loadBlogImages();
const usedTitles = new Set();
let rewritten = 0;
let preserved = 0;

for (let index = 0; index < posts.length; index++) {
  const post = posts[index];

  if (PRESERVE_SLUGS.has(post.slug)) {
    post.html = enhancePreservedPost(post);
    if (!post.excerpt || post.excerpt.length < 40) {
      post.excerpt = stripHtml(post.html).slice(0, 320);
    }
    usedTitles.add(post.title.toLowerCase());
    preserved++;
    continue;
  }

  const topic = pickTopic(index, post.slug);
  const meta = TOPIC_META[topic];
  const variants = ARTICLE_VARIANTS[topic] ?? ARTICLE_VARIANTS.community;
  const variant = variants[hash(post.slug) % variants.length];
  const postUrl = `${SITE}/blog/${post.slug}/`;
  const images = pickImages(post.slug, 3, imagePool);

  const title = uniqueTitle(variant.title, usedTitles, post);
  const html = buildArticleHtml({
    title,
    intro: variant.intro,
    sections: variant.sections,
    resources: meta.resources,
    images,
    imageAlt: meta.imageAlt,
    postUrl,
    topicLabel: meta.label,
  });

  post.title = title;
  post.html = html;
  post.excerpt = stripHtml(`${introPlain(variant.intro)} ${variant.sections[0]?.paragraphs[0] ?? ""}`).slice(0, 320);
  post.featuredImage = images[0];
  rewritten++;
}

console.log(`Rewrote ${rewritten} posts, preserved ${preserved} real stories (${posts.length} total)`);
console.log(`Image pool: ${imagePool.length} files`);

if (dryRun) {
  console.log("\nSample titles:");
  posts.slice(0, 8).forEach((p) => console.log(`  • ${p.title}`));
  console.log("\n(dry run — no file written)");
  process.exit(0);
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(`Wrote ${postsPath}`);
