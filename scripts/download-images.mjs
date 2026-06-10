/**
 * Download WordPress upload images into public/images/ (same pattern as agrasen public/blog/).
 * Rewrites src/content/*.json to use local paths like /images/2024/12/file.webp
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const PUBLIC_IMAGES = join(ROOT, 'public', 'images');

const WP_UPLOAD = 'https://agrawalfoundation.org/wp-content/uploads/';
const URL_RE = /https:\/\/agrawalfoundation\.org\/wp-content\/uploads\/[^"'\s<>\\]+/g;

function wpUrlToLocal(url) {
  const path = url.replace(WP_UPLOAD, '').replace(/\\/g, '');
  return `/images/${decodeURIComponent(path)}`;
}

function localToDisk(localPath) {
  return join(PUBLIC_IMAGES, localPath.replace(/^\/images\//, ''));
}

function collectUrlsFromText(text) {
  const urls = new Set();
  const matches = text.match(URL_RE) || [];
  for (let url of matches) {
    url = url.replace(/&#0*39;/g, "'").replace(/&amp;/g, '&');
    urls.add(url.split('?')[0]);
  }
  return urls;
}

function collectAllUrls() {
  const files = ['pages.json', 'posts.json', 'home.json'];
  const urls = new Set();
  for (const file of files) {
    const text = readFileSync(join(CONTENT, file), 'utf8');
    collectUrlsFromText(text).forEach((u) => urls.add(u));
  }
  return [...urls];
}

async function download(url, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) return 'skip';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LAF-Website-Export/1.0' },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return 'ok';
}

function rewriteFile(file) {
  const path = join(CONTENT, file);
  let text = readFileSync(path, 'utf8');
  const before = text;
  text = text.replace(URL_RE, (url) => wpUrlToLocal(url.split('?')[0]));
  if (text !== before) writeFileSync(path, text);
}

async function main() {
  const urls = collectAllUrls();
  console.log(`Found ${urls.length} unique WordPress image URLs`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const url of urls) {
    const local = wpUrlToLocal(url);
    const dest = localToDisk(local);
    try {
      const status = await download(url, dest);
      if (status === 'skip') skip++;
      else ok++;
      process.stdout.write('.');
    } catch (err) {
      fail++;
      console.warn(`\n  FAIL: ${url} — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDownloaded: ${ok}, skipped: ${skip}, failed: ${fail}`);
  for (const file of ['pages.json', 'posts.json', 'home.json']) {
    rewriteFile(file);
  }
  console.log('Rewrote content JSON to /images/ paths');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
