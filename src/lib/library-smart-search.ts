import {
  LIBRARY_CATEGORIES,
  type LibraryFilters,
} from "@/lib/library";

export type SmartSearchResult = {
  filters: LibraryFilters;
  summary: string;
};

const TOPIC_MAP: { pattern: RegExp; query: string; category?: string; module?: string }[] = [
  { pattern: /\brobot/, query: "robotics", category: "Robotics", module: "robotics" },
  { pattern: /\b(cod(e|ing)|program)/, query: "coding", category: "Coding" },
  { pattern: /\bscratch\b/, query: "scratch", category: "Coding" },
  { pattern: /\bmath/, query: "mathematics", category: "Mathematics" },
  { pattern: /\bscience\b/, query: "science", category: "Science" },
  { pattern: /\benglish\b/, query: "english", category: "English Learning" },
  { pattern: /\bscholarship/, query: "scholarship", category: "Scholarships", module: "scholarships" },
  { pattern: /\bvolunteer/, query: "volunteer", module: "volunteer" },
  { pattern: /\bngo\b/, query: "ngo", module: "ngo" },
  { pattern: /\bjee\b|\bneet\b|\bolympiad/, query: "competitive exam", category: "Competitive Exams" },
  { pattern: /\bstartup|\bentrepreneur/, query: "entrepreneurship", category: "Entrepreneurship" },
];

function ageFromText(text: string): string {
  const match = text.match(/(\d{1,2})\s*(?:year|yr|years?\s*old|yo\b)/i);
  if (!match) return "";
  const age = parseInt(match[1], 10);
  if (age <= 8) return "5-8";
  if (age <= 12) return "8-12";
  if (age <= 18) return "13-18";
  return "18+";
}

export function parseSmartSearchHeuristic(input: string): SmartSearchResult {
  const text = input.toLowerCase().trim();
  const filters: LibraryFilters = {
    query: "",
    category: "",
    ageGroup: ageFromText(text),
    difficulty: /\b(advanced|expert|hard)\b/.test(text)
      ? "Advanced"
      : /\b(intermediate|medium)\b/.test(text)
        ? "Intermediate"
        : /\b(beginner|easy|start)\b/.test(text)
          ? "Beginner"
          : "",
    cost: /\bfree\b/.test(text) ? "Free" : /\b(paid|premium)\b/.test(text) ? "Paid" : "",
    module: "",
  };

  for (const topic of TOPIC_MAP) {
    if (topic.pattern.test(text)) {
      filters.query = topic.query;
      if (topic.category) filters.category = topic.category;
      if (topic.module) filters.module = topic.module;
      break;
    }
  }

  if (!filters.query) {
    const words = text.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
    filters.query = words.slice(0, 3).join(" ");
  }

  const parts = [
    filters.query && `"${filters.query}"`,
    filters.ageGroup && `ages ${filters.ageGroup}`,
    filters.cost && filters.cost.toLowerCase(),
    filters.difficulty && filters.difficulty.toLowerCase(),
  ].filter(Boolean);

  return {
    filters,
    summary: parts.length ? `Showing ${parts.join(", ")}` : "Showing matching resources",
  };
}

export async function parseSmartSearch(input: string): Promise<SmartSearchResult> {
  const apiKey = process.env.LIBRARY_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey || input.trim().length < 4) {
    return parseSmartSearchHeuristic(input);
  }

  const prompt = `Convert this student/parent search into library filters. Return ONLY valid JSON:
{
  "query": "keywords for text search",
  "category": "one of ${LIBRARY_CATEGORIES.join("|")} or empty string",
  "ageGroup": "5-8|8-12|13-18|18+|empty string",
  "difficulty": "Beginner|Intermediate|Advanced|empty string",
  "cost": "Free|Freemium|Paid|empty string",
  "module": "general|robotics|scholarships|ngo|volunteer|empty string",
  "summary": "one short friendly sentence for the user"
}

Search: ${input}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) return parseSmartSearchHeuristic(input);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return parseSmartSearchHeuristic(input);

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      filters: {
        query: String(parsed.query ?? "").trim(),
        category: String(parsed.category ?? ""),
        ageGroup: String(parsed.ageGroup ?? ""),
        difficulty: String(parsed.difficulty ?? ""),
        cost: String(parsed.cost ?? ""),
        module: String(parsed.module ?? ""),
      },
      summary: String(parsed.summary ?? "Showing matching resources"),
    };
  } catch {
    return parseSmartSearchHeuristic(input);
  }
}
