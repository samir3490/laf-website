import { geminiGenerateJson } from "@/lib/gemini-json";
import {
  LIBRARY_CATEGORIES,
  type LibraryAgeGroup,
  type LibraryCategory,
  type LibraryCost,
  type LibraryDifficulty,
  type LibraryModule,
} from "@/lib/library";
import { evaluateSafety } from "@/lib/library-safety";
import type { PageMetadata } from "@/lib/library-url";

export type LibraryAnalysis = {
  title: string;
  description: string;
  categories: LibraryCategory[];
  ageGroups: LibraryAgeGroup[];
  difficulty: LibraryDifficulty;
  cost: LibraryCost;
  languages: string[];
  module: LibraryModule;
  safetyScore: number;
  educationalScore: number;
  rejected: boolean;
  rejectReason: string | null;
  eligibility?: string;
  deadline?: string;
  ageMin?: number;
  ageMax?: number;
};

const CATEGORY_KEYWORDS: Record<LibraryCategory, string[]> = {
  Education: ["education", "learn", "school", "course", "academy", "ncert", "khan"],
  Coding: ["code", "scratch", "blockly", "programming", "computing"],
  Programming: ["python", "javascript", "developer", "programming", "codecademy"],
  Robotics: ["robot", "arduino", "tinkercad", "microbit", "vex"],
  Mathematics: ["math", "geometry", "algebra", "calculus", "geogebra"],
  Science: ["science", "physics", "chemistry", "biology", "nasa", "phet"],
  "English Learning": ["english", "grammar", "vocabulary", "language"],
  Scholarships: ["scholarship", "fellowship", "grant", "financial aid"],
  "Career Guidance": ["career", "internship", "job", "resume", "placement"],
  "NGO Resources": ["ngo", "nonprofit", "charity", "csr", "philanthropy"],
  "Volunteer Training": ["volunteer", "child safety", "childline", "unicef"],
  "Soft Skills": ["communication", "leadership", "typing", "presentation"],
  "AI & Technology": ["artificial intelligence", "machine learning", " ai ", "technology"],
  "Competitive Exams": ["jee", "neet", "olympiad", "entrance exam", "competitive"],
  Entrepreneurship: ["startup", "entrepreneur", "business plan", "founder"],
};

function classifyHeuristic(meta: PageMetadata): Omit<LibraryAnalysis, "rejected" | "rejectReason"> {
  const text = `${meta.title} ${meta.description} ${meta.textSnippet} ${meta.url}`.toLowerCase();

  const categories = LIBRARY_CATEGORIES.filter((cat) =>
    CATEGORY_KEYWORDS[cat].some((kw) => text.includes(kw))
  ).slice(0, 4);

  if (categories.length === 0) categories.push("Education");

  let module: LibraryModule = "general";
  if (categories.includes("Robotics")) module = "robotics";
  else if (categories.includes("Scholarships")) module = "scholarships";
  else if (categories.includes("NGO Resources")) module = "ngo";
  else if (categories.includes("Volunteer Training")) module = "volunteer";

  const ageGroups: LibraryAgeGroup[] = [];
  if (/kids|children|elementary|ages? 2|ages? 3|ages? 4|ages? 5|ages? 6|ages? 7|ages? 8/.test(text)) {
    ageGroups.push("5-8");
  }
  if (/middle school|ages? 9|ages? 10|ages? 11|ages? 12|scratch|code.org/.test(text)) {
    ageGroups.push("8-12");
  }
  if (/high school|teen|ages? 13|ages? 14|ages? 15|ages? 16|ages? 17|ages? 18|jee|neet/.test(text)) {
    ageGroups.push("13-18");
  }
  if (/university|college|professional|adult|career|startup/.test(text)) {
    ageGroups.push("18+");
  }
  if (ageGroups.length === 0) ageGroups.push("8-12", "13-18");

  let difficulty: LibraryDifficulty = "Beginner";
  if (/advanced|university|engineering|professional certification/.test(text)) difficulty = "Advanced";
  else if (/intermediate|secondary|high school/.test(text)) difficulty = "Intermediate";

  let cost: LibraryCost = "Free";
  if (/subscription|premium|paid|pricing|buy now/.test(text)) cost = "Paid";
  else if (/freemium|free trial|upgrade/.test(text)) cost = "Freemium";

  const languages = ["English"];
  if (/hindi|हिंदी/.test(text)) languages.push("Hindi");
  if (/marathi|मराठी/.test(text)) languages.push("Marathi");

  let educationalScore = 70;
  if (categories.includes("Education") || categories.includes("Science")) educationalScore += 10;
  if (meta.description.length > 80) educationalScore += 5;
  if (/\.edu|\.gov|\.org|academy|official/.test(text)) educationalScore += 10;
  educationalScore = Math.min(98, educationalScore);

  const safety = evaluateSafety(meta.url, meta.title, meta.description, meta.textSnippet);

  const scholarshipExtras =
    module === "scholarships"
      ? {
          eligibility: "See official website for eligibility criteria",
          deadline: /deadline|apply by|last date/i.test(text)
            ? "See website for current deadlines"
            : "Varies — check website",
          ageMin: 13,
          ageMax: 25,
        }
      : {};

  return {
    title: meta.title,
    description: meta.description || `Educational resource at ${meta.url}`,
    categories,
    ageGroups,
    difficulty,
    cost,
    languages,
    module,
    safetyScore: safety.safetyScore,
    educationalScore,
    ...scholarshipExtras,
  };
}

async function classifyWithGemini(meta: PageMetadata): Promise<LibraryAnalysis | null> {
  const prompt = `Analyze this educational website and return ONLY valid JSON (no markdown):
{
  "categories": ["up to 4 from: ${LIBRARY_CATEGORIES.join(", ")}"],
  "ageGroups": ["one or more of: 5-8, 8-12, 13-18, 18+"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "cost": "Free|Freemium|Paid",
  "languages": ["English", "Hindi", "Marathi", "Other"],
  "module": "general|robotics|scholarships|ngo|volunteer",
  "safetyScore": 0-100,
  "educationalScore": 0-100,
  "summary": "2-3 sentence student-friendly description",
  "eligibility": "if scholarship site, brief eligibility or null",
  "deadline": "if known, deadline text or 'Varies' or null",
  "ageMin": null,
  "ageMax": null,
  "reject": false,
  "rejectReason": null
}

URL: ${meta.url}
Title: ${meta.title}
Description: ${meta.description}
Content snippet: ${meta.textSnippet.slice(0, 1200)}`;

  const gemini = await geminiGenerateJson(prompt);
  if (!gemini) return null;

  const parsed = gemini.data;
  const safety = evaluateSafety(meta.url, meta.title, meta.description, meta.textSnippet);

  if (safety.rejected || parsed.reject || (parsed.safetyScore as number ?? 100) < 70) {
    return {
      title: meta.title,
      description: String(parsed.summary ?? meta.description),
      categories: ["Education"],
      ageGroups: ["8-12"],
      difficulty: "Beginner",
      cost: "Free",
      languages: ["English"],
      module: "general",
      safetyScore: Math.min(safety.safetyScore, (parsed.safetyScore as number) ?? 0),
      educationalScore: 0,
      rejected: true,
      rejectReason: String(parsed.rejectReason ?? safety.rejectReason ?? "Failed safety review"),
    };
  }

  return {
    title: meta.title,
    description: String(parsed.summary ?? meta.description),
    categories: ((parsed.categories as LibraryCategory[]) ?? ["Education"]).slice(0, 4),
    ageGroups: (parsed.ageGroups as LibraryAgeGroup[]) ?? ["8-12", "13-18"],
    difficulty: (parsed.difficulty as LibraryDifficulty) ?? "Beginner",
    cost: (parsed.cost as LibraryCost) ?? "Free",
    languages: (parsed.languages as string[]) ?? ["English"],
    module: (parsed.module as LibraryModule) ?? "general",
    safetyScore: Math.max(safety.safetyScore, (parsed.safetyScore as number) ?? 80),
    educationalScore: (parsed.educationalScore as number) ?? 75,
    rejected: false,
    rejectReason: null,
    eligibility: parsed.eligibility ? String(parsed.eligibility) : undefined,
    deadline: parsed.deadline ? String(parsed.deadline) : undefined,
    ageMin: typeof parsed.ageMin === "number" ? parsed.ageMin : undefined,
    ageMax: typeof parsed.ageMax === "number" ? parsed.ageMax : undefined,
  };
}

export async function analyzeResource(meta: PageMetadata): Promise<LibraryAnalysis> {
  const safety = evaluateSafety(meta.url, meta.title, meta.description, meta.textSnippet);
  if (safety.rejected) {
    return {
      title: meta.title,
      description: meta.description,
      categories: ["Education"],
      ageGroups: ["8-12"],
      difficulty: "Beginner",
      cost: "Free",
      languages: ["English"],
      module: "general",
      safetyScore: safety.safetyScore,
      educationalScore: 0,
      rejected: true,
      rejectReason: safety.rejectReason,
    };
  }

  const ai = await classifyWithGemini(meta);
  if (ai) return ai;

  const heuristic = classifyHeuristic(meta);
  return { ...heuristic, rejected: false, rejectReason: null };
}
