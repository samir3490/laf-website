export const LIBRARY_CATEGORIES = [
  "Education",
  "Coding",
  "Programming",
  "Robotics",
  "Mathematics",
  "Science",
  "English Learning",
  "Scholarships",
  "Career Guidance",
  "NGO Resources",
  "Volunteer Training",
  "Soft Skills",
  "AI & Technology",
  "Competitive Exams",
  "Entrepreneurship",
] as const;

export const LIBRARY_AGE_GROUPS = ["5-8", "8-12", "13-18", "18+"] as const;
export const LIBRARY_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export const LIBRARY_COSTS = ["Free", "Freemium", "Paid"] as const;
export const LIBRARY_MODULES = ["general", "robotics", "scholarships", "ngo", "volunteer"] as const;

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];
export type LibraryAgeGroup = (typeof LIBRARY_AGE_GROUPS)[number];
export type LibraryDifficulty = (typeof LIBRARY_DIFFICULTIES)[number];
export type LibraryCost = (typeof LIBRARY_COSTS)[number];
export type LibraryModule = (typeof LIBRARY_MODULES)[number];

export type LibraryResource = {
  id?: string;
  slug: string;
  url: string;
  title: string;
  description: string;
  categories: LibraryCategory[];
  ageGroups: LibraryAgeGroup[];
  difficulty: LibraryDifficulty;
  cost: LibraryCost;
  languages: string[];
  module: LibraryModule;
  featured?: boolean;
  educationalScore?: number;
};

export type LibraryFilters = {
  query: string;
  category: string;
  ageGroup: string;
  difficulty: string;
  cost: string;
  module: string;
};

export const DEFAULT_LIBRARY_FILTERS: LibraryFilters = {
  query: "",
  category: "",
  ageGroup: "",
  difficulty: "",
  cost: "",
  module: "",
};

export function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return "/logo-square.png";
  }
}

export function normalizeLibraryResource(data: Record<string, unknown>, id?: string): LibraryResource | null {
  const slug = typeof data.slug === "string" ? data.slug : id;
  const url = typeof data.url === "string" ? data.url : "";
  const title = typeof data.title === "string" ? data.title : "";
  const description = typeof data.description === "string" ? data.description : "";
  if (!slug || !url || !title) return null;

  return {
    id: id ?? slug,
    slug,
    url,
    title,
    description,
    categories: Array.isArray(data.categories) ? (data.categories as LibraryCategory[]) : [],
    ageGroups: Array.isArray(data.ageGroups) ? (data.ageGroups as LibraryAgeGroup[]) : ["8-12"],
    difficulty: (data.difficulty as LibraryDifficulty) ?? "Beginner",
    cost: (data.cost as LibraryCost) ?? "Free",
    languages: Array.isArray(data.languages) ? (data.languages as string[]) : ["English"],
    module: (data.module as LibraryModule) ?? "general",
    featured: Boolean(data.featured),
    educationalScore:
      typeof data.educationalScore === "number" ? data.educationalScore : undefined,
  };
}

export function filterLibraryResources(
  resources: LibraryResource[],
  filters: LibraryFilters
): LibraryResource[] {
  const q = filters.query.trim().toLowerCase();

  return resources
    .filter((r) => {
      if (filters.module && r.module !== filters.module) return false;
      if (filters.category && !r.categories.includes(filters.category as LibraryCategory)) return false;
      if (filters.ageGroup && !r.ageGroups.includes(filters.ageGroup as LibraryAgeGroup)) return false;
      if (filters.difficulty && r.difficulty !== filters.difficulty) return false;
      if (filters.cost && r.cost !== filters.cost) return false;
      if (!q) return true;
      const haystack = [
        r.title,
        r.description,
        r.url,
        ...r.categories,
        ...r.languages,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const scoreA = a.educationalScore ?? 0;
      const scoreB = b.educationalScore ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.title.localeCompare(b.title);
    });
}

export function moduleLabel(module: LibraryModule): string {
  switch (module) {
    case "robotics":
      return "Robotics";
    case "scholarships":
      return "Scholarships";
    case "ngo":
      return "NGO Knowledge";
    case "volunteer":
      return "Volunteer Training";
    default:
      return "General";
  }
}
