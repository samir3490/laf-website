import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DRAWING_COMPETITION_PROMO_ALT } from "@/lib/drawing-competition-promo";

export const alt = DRAWING_COMPETITION_PROMO_ALT;
export const size = { width: 1536, height: 1024 };
export const contentType = "image/png";

/** Route-level OG image so crawlers that ignore meta tags still get the event photo. */
export default async function Image() {
  const bytes = await readFile(
    join(process.cwd(), "public", "images", "drawing-competition-2026-og.png")
  );
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
