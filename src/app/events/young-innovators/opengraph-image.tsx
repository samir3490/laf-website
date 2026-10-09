import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { YOUNG_INNOVATORS_PROMO_ALT } from "@/lib/young-innovators";

export const alt = YOUNG_INNOVATORS_PROMO_ALT;
export const size = { width: 1280, height: 720 };
export const contentType = "image/jpeg";

/** Route-level OG image so crawlers that ignore meta tags still get the event photo. */
export default async function Image() {
  const bytes = await readFile(
    join(process.cwd(), "public", "images", "young-innovators-2026-og.jpg")
  );
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
