/**
 * Copy GMAIL_* into laf-website/.env.local from:
 *   1) donor-transparency/.env
 *   2) donor-transparency/.env.vercel.production (after vercel env pull)
 *
 * Run: npm run sync:gmail-env
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localEnv = join(__dirname, "../.env.local");
const sources = [
  join(__dirname, "../../donor-transparency/.env"),
  join(__dirname, "../../donor-transparency/.env.vercel.production"),
];

function parseEnv(text) {
  const vars = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[trimmed.slice(0, eq)] = value;
  }
  return vars;
}

function upsertEnvLine(lines, key, value) {
  const prefix = `${key}=`;
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  const next = `${key}=${value}`;
  if (idx >= 0) lines[idx] = next;
  else lines.push(next);
}

const merged = {};
for (const path of sources) {
  if (!existsSync(path)) continue;
  Object.assign(merged, parseEnv(readFileSync(path, "utf8")));
}

const gmailUser = merged.GMAIL_USER?.trim();
const gmailPass = merged.GMAIL_APP_PASSWORD?.trim();
const fromName = merged.GMAIL_FROM_NAME?.trim();

if (!gmailUser || !gmailPass) {
  console.error(
    "GMAIL_USER or GMAIL_APP_PASSWORD not found. Run in donor-transparency:\n  vercel env pull .env.vercel.production --environment=production --yes"
  );
  process.exit(1);
}

const existing = existsSync(localEnv) ? readFileSync(localEnv, "utf8") : "";
const lines = existing.split("\n").filter((l, i, arr) => i < arr.length - 1 || l.length > 0);

upsertEnvLine(lines, "GMAIL_USER", gmailUser);
upsertEnvLine(lines, "GMAIL_APP_PASSWORD", gmailPass);
if (fromName) upsertEnvLine(lines, "GMAIL_FROM_NAME", fromName);

writeFileSync(localEnv, lines.join("\n") + "\n", "utf8");
console.log(`Updated ${localEnv} with GMAIL_* from donor portal.`);
