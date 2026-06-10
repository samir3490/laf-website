import { readFileSync } from 'fs';
const pages = JSON.parse(readFileSync('src/content/pages.json', 'utf8'));
for (const slug of ['become-a-volunteer', 'contact-us']) {
  const html = pages[slug]?.html || '';
  console.log('\n===', slug, '===');
  const patterns = [
    /portalId['":\s]+['"]?(\d+)/gi,
    /formId['":\s]+['"]?([a-f0-9-]{36})/gi,
    /data-form-id=["']([^"']+)/gi,
    /hs-form-([a-f0-9-]+)/gi,
    /js\.hsforms\.net[^"']*/gi,
    /hs-scripts\.com\/(\d+)/gi,
  ];
  for (const re of patterns) {
    const m = [...html.matchAll(re)];
    if (m.length) console.log(re.source, m.map((x) => x[1] || x[0]));
  }
  const idx = html.toLowerCase().indexOf('hubspot');
  if (idx >= 0) console.log('snippet:', html.slice(idx, idx + 400));
}
