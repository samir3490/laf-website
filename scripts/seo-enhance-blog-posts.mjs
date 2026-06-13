/**
 * SEO pass on all blog posts in posts.json:
 * - Strip Articly scripts, hidden tags, promo blocks
 * - Rewrite external agrawalfoundation.org links → internal paths
 * - Append internal link footer (donate, volunteer, library, events) if missing
 *
 *   node scripts/seo-enhance-blog-posts.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, "../src/content/posts.json");
const posts = JSON.parse(readFileSync(postsPath, "utf8"));

const SEO_FOOTER_MARKER = "laf-seo-footer";

const SEO_FOOTER = `
<div class="${SEO_FOOTER_MARKER} laf-blog-footer">
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

function stripJunk(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<p>\s*<meta[^>]*>\s*<\/p>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<a[^>]*articly\.ai[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<div[^>]*articly[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<p[^>]*>\s*Tags:\s*<\/p>/gi, "")
    .replace(/<span[^>]*display:\s*none[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

function rewriteLinks(html) {
  return html
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/donate-now\/?/gi, "/donate")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/become-a-volunteer\/?/gi, "/volunteer")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/contact-us\/?/gi, "/contact")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/about-us\/?/gi, "/about")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/blog\/?/gi, "/blog")
    .replace(/https?:\/\/(?:www\.)?agrawalfoundation\.org\/?/gi, "/");
}

function appendSeoFooter(html) {
  if (html.includes(SEO_FOOTER_MARKER)) return html;
  return `${html.trim()}\n${SEO_FOOTER}\n`;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let updated = 0;

for (const post of posts) {
  const before = post.html;
  let html = stripJunk(before);
  html = rewriteLinks(html);
  html = appendSeoFooter(html);

  if (html !== before) {
    post.html = html;
    if (!post.excerpt || post.excerpt.length < 40) {
      post.excerpt = stripHtml(html).slice(0, 320);
    }
    updated++;
  }
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(`SEO-enhanced ${updated}/${posts.length} posts → ${postsPath}`);
