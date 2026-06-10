/**
 * Download articly/Unsplash hotlinked images from posts.json into public/images/blog/
 * and rewrite src/content/posts.json to use local paths. Sets featuredImage per post.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_PATH = join(ROOT, "src", "content", "posts.json");
const OUT_DIR = join(ROOT, "public", "images", "blog");

const UNSPLASH_RE =
  /https?:\/\/[^"'\s<>\\]*(?:images\.unsplash\.com|amazonaws\.com\/images\.unsplash)[^"'\s<>\\]*/g;

function photoIdFromUrl(url) {
  const photo = url.match(/(photo-[a-zA-Z0-9-]+)/);
  if (photo) return photo[1];
  const file = url.match(/\/([a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp))(?:\?|$)/i);
  if (file) return file[1].replace(/\.[a-z]+$/i, "");
  return `img-${Buffer.from(url).toString("base64url").slice(0, 16)}`;
}

function unsplashToFetchUrl(url) {
  const id = photoIdFromUrl(url);
  return `https://images.unsplash.com/${id}?w=1200&q=80&auto=format`;
}

function localPathFor(url) {
  return `/images/blog/${photoIdFromUrl(url)}.jpg`;
}

async function download(url, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) return "skip";
  const candidates = [unsplashToFetchUrl(url), url];
  let lastErr;
  for (const fetchUrl of candidates) {
    const res = await fetch(fetchUrl, {
      headers: { "User-Agent": "LAF-Website-Export/1.0" },
      redirect: "follow",
    });
    if (res.ok) {
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      return "ok";
    }
    lastErr = `${res.status} ${fetchUrl}`;
  }
  throw new Error(lastErr);
}

function firstImageSrc(html) {
  const match = html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return match ? match[1] : null;
}

async function main() {
  const posts = JSON.parse(readFileSync(POSTS_PATH, "utf8"));
  const allText = readFileSync(POSTS_PATH, "utf8");
  const unique = [...new Set((allText.match(UNSPLASH_RE) || []).map((u) => u.split("?")[0]))];
  console.log(`Found ${unique.length} unique Unsplash URLs`);

  const urlToLocal = new Map();
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const url of unique) {
    const local = localPathFor(url);
    const dest = join(ROOT, "public", ...local.replace(/^\/images\//, "images/").split("/"));
    try {
      const status = await download(url, dest);
      urlToLocal.set(url, local);
      if (status === "skip") skip++;
      else ok++;
      process.stdout.write(".");
    } catch (err) {
      fail++;
      console.warn(`\n  FAIL: ${url} — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nDownloaded: ${ok}, skipped: ${skip}, failed: ${fail}`);

  for (const post of posts) {
    let html = post.html;
    for (const [url, local] of urlToLocal) {
      html = html.split(url).join(local);
    }
    post.html = html;
    post.featuredImage = firstImageSrc(html);
  }

  writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2) + "\n");
  console.log("Updated posts.json with local image paths and featuredImage fields");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
