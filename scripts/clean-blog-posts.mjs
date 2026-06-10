/**
 * Clean blog posts for accuracy / tone (strip AI junk, LAF intros, full rewrites).
 *
 *   node scripts/clean-blog-posts.mjs              # top 10 by date (default)
 *   node scripts/clean-blog-posts.mjs --offset 10 --limit 30
 *   node scripts/clean-blog-posts.mjs --all        # every post missing LAF intro
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, "../src/content/posts.json");
const posts = JSON.parse(readFileSync(postsPath, "utf8"));

const args = process.argv.slice(2);
const offset = args.includes("--all")
  ? 0
  : Number(args[args.indexOf("--offset") + 1] ?? 0);
const limit = args.includes("--all")
  ? posts.length
  : Number(args[args.indexOf("--limit") + 1] ?? 10);
const allMode = args.includes("--all");

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
      "Digital donation platforms make it easier for supporters in India and abroad to contribute quickly and securely.",
      "Responsible online giving means choosing registered organisations, reading how funds are used, and giving what you can sustain.",
    ],
    sections: [
      {
        title: "Give with confidence",
        body: "Look for registered NGOs, clear use-of-funds information, and receipts for tax purposes where applicable.",
      },
      {
        title: "Support LAF",
        body: "Visit our donate page or contact us to learn how your gift supports children on the ground.",
      },
    ],
  },
  "chef-sunitas-indian-kids-food-drive": {
    title: "Community Food Drives for Children: Why They Matter",
    intro: [
      LAF_CONTEXT,
      "Community food drives bring neighbours, volunteers, and local businesses together to collect staples for families who need extra support.",
      "These drives work best when planned with local schools or anganwadi centres so food reaches children with dignity and without waste.",
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
  "curry-for-a-cause-indian-kids-kibble-kitchen": {
    title: "Community Meals for Children in India",
    intro: [
      LAF_CONTEXT,
      "Nutritious community meals help children stay in school and grow with energy to learn. Many families in rural areas appreciate support during lean seasons or when medical or school expenses stretch household budgets.",
      "Food drives and meal sponsorships are practical ways supporters can help — rice, dal, vegetables, and fruit go a long way when coordinated through schools or local partners.",
    ],
    sections: [
      {
        title: "Why meals matter",
        body: "Regular, balanced food reduces absenteeism and helps children focus in class. Community kitchens and anganwadi centres are trusted places to serve meals safely.",
      },
      {
        title: "How to contribute",
        body: "Donate staples, sponsor a week's meals, or volunteer to pack and distribute food with a registered organisation you trust.",
      },
    ],
  },
  "controversial-call-to-action-support-indian-kids-by-donating-computers-today": {
    title: "Donating Computers and Devices for Children's Learning",
    intro: [
      LAF_CONTEXT,
      "Access to computers and tablets opens doors to coding tutorials, online classes, and digital literacy — skills that matter for school and future work.",
      "If you have working laptops or tablets to donate, partner with a registered NGO or school so devices are wiped, configured safely, and given to students who need them.",
    ],
    sections: [
      {
        title: "What makes a useful donation",
        body: "Devices should boot reliably, include chargers, and be free of personal data. NGOs often need basic specs: 4 GB RAM or more for modern browsers and learning apps.",
      },
      {
        title: "Get in touch",
        body: "Contact us to discuss device donations for learning centres we support, or volunteer to help students learn digital skills.",
      },
    ],
  },
  "controversial-call-to-action-support-indian-kids-by-donating-computers-today-2": {
    title: "Give Old Laptops a Second Life for Students",
    intro: [
      LAF_CONTEXT,
      "Refurbished laptops help students access online learning, Scratch coding, and homework resources they might otherwise miss.",
      "Before donating, back up and wipe your data, include the charger, and check with a school or NGO about their current needs.",
    ],
    sections: [
      {
        title: "Safe handover",
        body: "Registered partners can help with data wiping and basic setup so students receive devices ready to use.",
      },
      {
        title: "Volunteer too",
        body: "Mentoring students on basic computer skills multiplies the impact of every device donated.",
      },
    ],
  },
};

function shouldPreserveBody(post) {
  return (
    /wp-block-image|wp-block-gallery|class="wp-image-/.test(post.html) ||
    post.slug.includes("lata-agrawal-foundation") ||
    post.slug.includes("checkup") ||
    post.slug.includes("dental")
  );
}

function hasLafIntro(post) {
  return post.html.includes("At Lata Agrawal Foundation, we work with communities");
}

const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
const targetSet = allMode
  ? new Set(sorted.filter((p) => !hasLafIntro(p)).map((p) => p.slug))
  : new Set(sorted.slice(offset, offset + limit).map((p) => p.slug));

let updated = 0;

for (const post of posts) {
  if (!targetSet.has(post.slug)) continue;

  if (shouldPreserveBody(post)) {
    post.html = stripMetaFromHtml(post.html);
    post.excerpt = stripHtml(post.html).slice(0, 320);
    updated++;
    continue;
  }

  let html = stripMetaFromHtml(post.html);
  let title = post.title;
  let excerpt = post.excerpt;

  const rewrite = REWRITES[post.slug];
  if (rewrite) {
    title = rewrite.title;
    html = buildCleanHtml(rewrite.intro, rewrite.sections ?? []);
    excerpt = [...rewrite.intro, ...(rewrite.sections ?? []).map((s) => s.body)].join(" ").slice(0, 320);
  } else {
    html = replacePostOpenIntro(html, [
      LAF_CONTEXT,
      "The sections below share practical ways supporters can help children through food, education, and community action. We encourage thoughtful giving and volunteering with trusted local partners.",
    ]);
    const openPlain = stripHtml(html.match(/<div class='post_open'>[\s\S]*?<\/div>/i)?.[0] ?? "");
    excerpt = openPlain.slice(0, 320);
  }

  post.title = title;
  post.html = html;
  post.excerpt = excerpt;
  updated++;
}

writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(
  `Updated ${updated} posts (${allMode ? "all remaining" : `offset ${offset}, limit ${limit}`}) → ${postsPath}`
);
