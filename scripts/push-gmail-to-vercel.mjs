/**
 * Copy GMAIL_* from donor-transparency Vercel env into laf-website Vercel (Production + Preview).
 *
 * Prerequisite:
 *   cd ../donor-transparency && vercel env pull .env.vercel.production --environment=production --yes
 *
 * Run from laf-website:
 *   node scripts/push-gmail-to-vercel.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const donorEnv = join(__dirname, "../../donor-transparency/.env.vercel.production");

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

function addEnv(key, value, target) {
  execSync(`vercel env add ${key} ${target} --force`, {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
    cwd: join(__dirname, ".."),
  });
}

if (!existsSync(donorEnv)) {
  console.error("Missing donor-transparency/.env.vercel.production — run vercel env pull there first.");
  process.exit(1);
}

const vars = parseEnv(readFileSync(donorEnv, "utf8"));
const keys = ["GMAIL_USER", "GMAIL_APP_PASSWORD", "GMAIL_FROM_NAME"];

for (const key of keys) {
  const value = vars[key]?.trim();
  if (!value || value === '""' || value === "''") {
    console.warn(`Skip ${key} — empty in donor env file (Vercel pull hides secrets). Copy manually in Vercel dashboard.`);
    continue;
  }
  for (const target of ["production", "preview"]) {
    console.log(`Setting ${key} on ${target}…`);
    addEnv(key, value, target);
  }
}

console.log("Done. Redeploy laf-website for emails to work in production.");
