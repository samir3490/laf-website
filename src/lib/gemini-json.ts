const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export function getGeminiApiKey(): string | undefined {
  return process.env.LIBRARY_AI_API_KEY ?? process.env.GEMINI_API_KEY;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function geminiGenerateJson(
  prompt: string
): Promise<{ data: Record<string, unknown>; model: string } | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 512,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );

      if (!res.ok) continue;

      const body = await res.json();
      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const data = extractJsonObject(text);
      if (data) return { data, model };
    } catch {
      continue;
    }
  }

  return null;
}
