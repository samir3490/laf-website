/**
 * Review and clean the 10 most recent blog posts (accuracy / tone pass).
 * Run: node scripts/clean-blog-top10.mjs
 * Writes: src/content/posts.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, "../src/content/posts.json");
const posts = JSON.parse(readFileSync(postsPath, "utf8"));

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMetaFromHtml(html) {
  return html.replace(/<p>\s*<meta[^>]*>\s*<\/p>/gi, "").replace(/<meta[^>]*>/gi, "");
}

function replacePostOpenIntro(html, introParagraphs) {
  const body = introParagraphs.map((p) => `<p>${p}</p>`).join("\n");
  if (/<div class='post_open'>/.test(html)) {
    return html.replace(
      /<div class='post_open'>[\s\S]*?(?=<h2|<h3|<table|<ul|<ol|$)/i,
      `<div class='post_open'>\n${body}\n`
    );
  }
  return `<div class='post_open'>\n${body}\n</div>\n${html}`;
}

const LAF_CONTEXT =
  "At Lata Agrawal Foundation, we work with communities in Wardha and across India to support children's education, nutrition, and wellbeing.";

function buildCleanHtml(intro, sections = []) {
  const open = intro.map((p) => `<p>${p}</p>`).join("\n");
  const body = sections
    .map((s) => `<h2>${s.title}</h2>\n<p>${s.body}</p>`)
    .join("\n");
  return `<div class='post_open'>\n${open}\n</div>\n${body}\n<p><a href="/donate">Support our work</a> · <a href="/volunteer">Volunteer with us</a></p>`;
}

const REWRITES = {
  "nourish-native-youth-food-fundamentals": {
    title: "Nutrition Basics for Village Children in India",
    intro: [
      LAF_CONTEXT,
      "Good nutrition helps children stay healthy, attend school regularly, and learn with focus. In many rural areas, families face gaps in balanced meals — not because of lack of care, but because of limited resources and awareness.",
      "Simple habits matter: regular meals with grains, pulses, vegetables, and clean drinking water; hygiene while preparing food; and community support when harvests or incomes fall short.",
    ],
    sections: [
      {
        title: "Why nutrition and learning go together",
        body: "When children eat well, they concentrate better in class and miss fewer days due to illness. Schools and anganwadi centres are natural places to combine meals with learning support.",
      },
      {
        title: "How you can help",
        body: "Supporters can sponsor meals, donate staples, or volunteer with local partners. Consistent, small contributions often help more than one-time gifts.",
      },
    ],
  },
  "indian-website-fights-hunger-with-flavorful-donations": {
    title: "How Online Giving Helps Fight Child Hunger in India",
    intro: [
      LAF_CONTEXT,
      "Digital donation platforms make it easier for supporters in India and abroad to contribute quickly and securely. When giving is simple, more people can help during urgent needs — school terms, festivals, or after a difficult harvest season.",
      "Responsible online giving means choosing registered organisations, reading how funds are used, and giving what you can sustain.",
    ],
    sections: [
      {
        title: "Give with confidence",
        body: "Look for registered NGOs, clear use-of-funds information, and receipts for tax purposes where applicable. Ask questions if something is unclear — trustworthy organisations welcome them.",
      },
      {
        title: "Support LAF",
        body: "If you would like to support children through Lata Agrawal Foundation, visit our donate page or contact us to learn how your gift is used on the ground.",
      },
    ],
  },
  "chef-sunitas-indian-kids-food-drive": {
    title: "Community Food Drives for Children: Why They Matter",
    intro: [
      LAF_CONTEXT,
      "Community food drives bring neighbours, volunteers, and local businesses together to collect staples — rice, dal, oil, vegetables, and snacks — for families who need extra support.",
      "These drives work best when they are planned with local schools or anganwadi centres so food reaches children who need it most, with dignity and without waste.",
    ],
    sections: [
      {
        title: "Planning a successful drive",
        body: "Set a clear goal, coordinate pickup points, and partner with a registered NGO or school so donations are stored and distributed safely.",
      },
      {
        title: "Volunteer your time",
        body: "Sorting, packing, and delivering food are hands-on ways to help. Even a few hours with your workplace or alumni group can feed many children.",
      },
    ],
  },
};

const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
const top10Slugs = new Set(sorted.slice(0, 10).map((p) => p.slug));

let updated = 0;

for (const post of posts) {
  if (!top10Slugs.has(post.slug)) continue;

  let html = stripMetaFromHtml(post.html);
  let title = post.title;
  let excerpt = post.excerpt;

  const rewrite = REWRITES[post.slug];
  if (rewrite) {
    title = rewrite.title;
    html = buildCleanHtml(rewrite.intro, rewrite.sections ?? []);
    excerpt = [...rewrite.intro, ...(rewrite.sections ?? []).map((s) => s.body)].join(" ").slice(0, 320);
    updated++;
  } else {
    html = replacePostOpenIntro(html, [
      LAF_CONTEXT,
      "The sections below share practical ways supporters can help children through food, education, and community action. We encourage thoughtful giving and volunteering with trusted local partners.",
    ]);
    const openPlain = stripHtml(html.match(/<div class='post_open'>[\s\S]*?<\/div>/i)?.[0] ?? "");
    excerpt = openPlain.slice(0, 320);
    updated++;
  }

  post.title = title;
  post.html = html;
  post.excerpt = excerpt;
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(`Updated ${updated} of 10 most recent posts in ${postsPath}`);
