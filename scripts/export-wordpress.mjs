/**
 * Phase 1: Export WordPress content from agrawalfoundation.org (public REST API).
 * Run: node scripts/export-wordpress.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'content');
const BASE = 'https://agrawalfoundation.org/wp-json/wp/v2';

const CORE_PAGE_SLUGS = new Set([
  'home-2',
  'about-us',
  'donate-now',
  'contact-us',
  'faq',
  'become-a-volunteer',
  'service-we-provide',
  'csr-companies',
  'community-scratch-games',
  'privacy-policy',
  'terms-conditions',
  'news-2',
]);

const FETCH_OPTS = {
  headers: {
    Accept: 'application/json',
    'User-Agent': 'LAF-Website-Export/1.0',
  },
};

async function fetchJson(url) {
  const res = await fetch(url, FETCH_OPTS);
  const text = await res.text();
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  if (text.trimStart().startsWith('<')) {
    throw new Error(`${url}: expected JSON, got HTML`);
  }
  return JSON.parse(text);
}

async function fetchBySlug(endpoint, slug, extra = {}) {
  const qs = new URLSearchParams({ slug, ...extra });
  const batch = await fetchJson(`${BASE}/${endpoint}?${qs}`);
  return Array.isArray(batch) && batch.length > 0 ? batch[0] : null;
}

async function fetchAllPosts() {
  const items = [];
  let page = 1;
  while (true) {
    const qs = new URLSearchParams({ per_page: '20', page: String(page), status: 'publish' });
    let batch;
    try {
      batch = await fetchJson(`${BASE}/posts?${qs}`);
    } catch (err) {
      console.warn(`Posts page ${page} failed:`, err.message);
      break;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 20) break;
    page++;
    await new Promise((r) => setTimeout(r, 300));
  }
  return items;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImages(html) {
  if (!html) return [];
  const urls = [];
  const re = /src=["'](https:\/\/agrawalfoundation\.org\/wp-content\/uploads\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!urls.includes(m[1])) urls.push(m[1]);
  }
  return urls;
}

function mapPage(p) {
  const html = p.content?.rendered || '';
  return {
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered?.replace(/<[^>]+>/g, '') || '',
    excerpt: stripHtml(p.excerpt?.rendered || '').slice(0, 300),
    html,
    images: extractImages(html),
    modified: p.modified,
    link: p.link,
  };
}

function mapPost(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered?.replace(/<[^>]+>/g, '') || '',
    excerpt: stripHtml(p.excerpt?.rendered || ''),
    html: p.content?.rendered || '',
    date: p.date,
    link: p.link,
    featuredMedia: p.featured_media || null,
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log('Fetching pages by slug...');
  const mappedPages = {};
  for (const slug of CORE_PAGE_SLUGS) {
    try {
      const p = await fetchBySlug('pages', slug);
      if (p) mappedPages[slug] = mapPage(p);
      else console.warn(`  missing: ${slug}`);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.warn(`  ${slug}: ${err.message}`);
    }
  }

  console.log('Fetching posts...');
  const posts = await fetchAllPosts();
  const mappedPosts = posts.map(mapPost);

  console.log('Skipping bulk media (fetch individually later if needed)...');
  const media = [];
  const mappedMedia = media.slice(0, 200).map((m) => ({
    id: m.id,
    url: m.source_url,
    title: m.title?.rendered || '',
    alt: m.alt_text || '',
    mime: m.mime_type,
  }));

  const redirects = [
    { from: '/about-us', to: '/about' },
    { from: '/donate-now', to: '/donate' },
    { from: '/contact-us', to: '/contact' },
    { from: '/become-a-volunteer', to: '/volunteer' },
    { from: '/news-2', to: '/blog' },
    { from: '/faqs', to: '/faq' },
  ];

  const site = {
    name: 'Lata Agrawal Foundation',
    tagline: 'We aim to bridge the education gap by providing essential resources, mentorship, and opportunities.',
    url: 'https://agrawalfoundation.org',
    contact: {
      email: 'info@agrawalfoundation.org',
      phone: '+91 7152 123456',
      address: 'Wardha, Maharashtra, India',
    },
    razorpayPaymentButtonId: 'pl_PetTf2rANXljZC',
    exportedAt: new Date().toISOString(),
  };

  writeFileSync(join(OUT, 'site.json'), JSON.stringify(site, null, 2));
  writeFileSync(join(OUT, 'pages.json'), JSON.stringify(mappedPages, null, 2));
  writeFileSync(join(OUT, 'posts.json'), JSON.stringify(mappedPosts, null, 2));
  writeFileSync(join(OUT, 'media.json'), JSON.stringify(mappedMedia, null, 2));
  writeFileSync(join(OUT, 'redirects.json'), JSON.stringify(redirects, null, 2));

  console.log(`Exported ${Object.keys(mappedPages).length} pages, ${mappedPosts.length} posts.`);
  console.log('Run: npm run download:images');
  console.log(`Output: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
