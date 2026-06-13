import { getGeminiApiKey } from "@/lib/gemini-json";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

export type DrawingModerationResult = {
  approved: boolean;
  confidence: "high" | "medium" | "low";
  reason: string;
  model?: string;
};

const MODERATION_PROMPT = `You moderate uploads for a children's drawing competition (ages 1–18).
Review the image and respond with JSON only:
{
  "appropriate": boolean,
  "confidence": "high" | "medium" | "low",
  "reason": "short explanation"
}

Mark appropriate=false for: sexual content, nudity, violence/gore, hate symbols, drugs/alcohol, spam/ads,
non-artwork photos (selfies, screenshots, memes), or clearly disturbing content.

Mark appropriate=true for: children's drawings, paintings, crayon art, photos of artwork on paper,
simple sketches, and typical school art projects. When unsure, use appropriate=true with confidence=low.`;

function parseModeration(data: Record<string, unknown>): DrawingModerationResult | null {
  const appropriate = data.appropriate;
  const confidence = data.confidence;
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";
  if (typeof appropriate !== "boolean") return null;
  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") return null;
  return {
    approved: appropriate,
    confidence,
    reason: reason || (appropriate ? "Looks like appropriate artwork." : "Flagged by content review."),
  };
}

/** Returns null when Gemini is not configured — caller should fall back to manual review. */
export async function moderateDrawingImage(
  buffer: Buffer,
  mimeType: string
): Promise<DrawingModerationResult | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const base64 = buffer.toString("base64");

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: MODERATION_PROMPT },
                  { inlineData: { mimeType, data: base64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 256,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(25000),
        }
      );

      if (!res.ok) continue;

      const body = await res.json();
      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start < 0 || end <= start) continue;

      const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
      const result = parseModeration(parsed);
      if (result) return { ...result, model };
    } catch {
      continue;
    }
  }

  return null;
}

/** Safe images publish immediately; uncertain or rejected ones need admin review. */
export function shouldAutoPublishEntry(result: DrawingModerationResult | null): boolean {
  if (!result) return false;
  if (result.approved && result.confidence !== "low") return true;
  return false;
}
