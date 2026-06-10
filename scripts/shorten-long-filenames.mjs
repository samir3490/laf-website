import { readdirSync, renameSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'public', 'images');
const CONTENT = join(ROOT, 'src', 'content');
const MAX = 120;

function walk(dir, files = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

const renames = [];
for (const file of walk(IMAGES)) {
  const rel = file.slice(IMAGES.length + 1).replace(/\\/g, '/');
  if (rel.length <= MAX) continue;
  const dir = dirname(file);
  const ext = file.slice(file.lastIndexOf('.'));
  const short = `img-${Buffer.from(rel).toString('hex').slice(0, 16)}${ext}`;
  const dest = join(dir, short);
  renameSync(file, dest);
  renames.push({ from: `/images/${rel}`, to: `/images/${dirname(rel).replace(/\\/g, '/')}/${short}`.replace('/./', '/') });
  console.log(`${rel} -> ${short}`);
}

if (renames.length) {
  for (const file of ['pages.json', 'posts.json', 'home.json']) {
    const path = join(CONTENT, file);
    let text = readFileSync(path, 'utf8');
    for (const { from, to } of renames) {
      text = text.split(from).join(to);
    }
    writeFileSync(path, text);
  }
}

console.log(`Renamed ${renames.length} files`);
