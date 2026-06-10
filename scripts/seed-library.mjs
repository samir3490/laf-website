/**
 * Seed library_resources in Firestore (lata-agrawal-foundation).
 *
 * Usage:
 *   npm run seed:library
 *
 * Requires one of:
 *   - GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file
 *   - FIREBASE_SERVICE_ACCOUNT_JSON env var (full JSON string)
 *
 * Uses document ID = slug. Skips docs that already exist unless --force is passed.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes("--force");
const projectId = process.env.FIREBASE_PROJECT_ID ?? "lata-agrawal-foundation";

function loadCredential() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return cert(JSON.parse(inline));
  }
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (path) {
    return cert(JSON.parse(readFileSync(path, "utf8")));
  }
  throw new Error(
    "Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON to run the seed script."
  );
}

if (!getApps().length) {
  initializeApp({ credential: loadCredential(), projectId });
}

const db = getFirestore();
const seedPath = join(__dirname, "../src/content/library-resources.json");
const resources = JSON.parse(readFileSync(seedPath, "utf8"));

let created = 0;
let skipped = 0;

for (const item of resources) {
  const ref = db.collection("library_resources").doc(item.slug);
  const existing = await ref.get();

  if (existing.exists && !force) {
    skipped++;
    continue;
  }

  await ref.set({
    ...item,
    status: "approved",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  created++;
}

console.log(
  `library_resources seed complete: ${created} written, ${skipped} skipped${force ? " (force mode)" : ""}.`
);
