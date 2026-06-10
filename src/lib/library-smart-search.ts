import { geminiGenerateJson } from "@/lib/gemini-json";
import {
  LIBRARY_AGE_GROUPS,
  LIBRARY_CATEGORIES,
  LIBRARY_COSTS,
  LIBRARY_DIFFICULTIES,
  LIBRARY_MODULES,
  type LibraryFilters,
} from "@/lib/library";

export type SmartSearchResult = {
  filters: LibraryFilters;
  summary: string;
  source: "gemini" | "heuristic";
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

function sanitizeFilterValue<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  const v = String(value ?? "").trim();
  return (allowed as readonly string[]).includes(v) ? (v as T) : "";
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
    source: "heuristic",
  };
}

export async function parseSmartSearch(input: string): Promise<SmartSearchResult> {
  if (input.trim().length < 4) {
    return parseSmartSearchHeuristic(input);
  }

  const categoriesList = LIBRARY_CATEGORIES.join(", ");
  const prompt = `You help students find free learning websites. Convert the search below into JSON filters.

Return JSON with these keys only:
- query (string, 1-4 keywords for text search)
- category (string, must be exactly one of: ${categoriesList}, or "")
- ageGroup (string, one of: 5-8, 8-12, 13-18, 18+, or "")
- difficulty (string, one of: Beginner, Intermediate, Advanced, or "")
- cost (string, one of: Free, Freemium, Paid, or "")
- module (string, one of: general, robotics, scholarships, ngo, volunteer, or "")
- summary (string, one friendly sentence for the user, e.g. "Here are free coding sites for ages 8-12.")

Search: "${input.replace(/"/g, "'")}"`;

  const gemini = await geminiGenerateJson(prompt);
  if (!gemini) {
    return parseSmartSearchHeuristic(input);
  }

  const parsed = gemini.data;
  const filters: LibraryFilters = {
    query: String(parsed.query ?? "").trim(),
    category: sanitizeFilterValue(parsed.category, LIBRARY_CATEGORIES),
    ageGroup: sanitizeFilterValue(parsed.ageGroup, LIBRARY_AGE_GROUPS),
    difficulty: sanitizeFilterValue(parsed.difficulty, LIBRARY_DIFFICULTIES),
    cost: sanitizeFilterValue(parsed.cost, LIBRARY_COSTS),
    module: sanitizeFilterValue(parsed.module, LIBRARY_MODULES),
  };

  if (!filters.query) {
    const fallback = parseSmartSearchHeuristic(input);
    return { ...fallback, source: "heuristic" };
  }

  return {
    filters,
    summary: String(parsed.summary ?? "Here are resources that match your search."),
    source: "gemini",
  };
}
