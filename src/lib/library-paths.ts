import pathsData from "@/content/library-paths.json";

export type LearningPathStep = {
  slug: string;
  label: string;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  module: string;
  steps: LearningPathStep[];
};

export function getLearningPaths(): LearningPath[] {
  return pathsData as LearningPath[];
}

export function getLearningPath(id: string): LearningPath | undefined {
  return getLearningPaths().find((p) => p.id === id);
}

export function getPathsForResource(slug: string): {
  path: LearningPath;
  stepIndex: number;
  nextSteps: LearningPathStep[];
}[] {
  return getLearningPaths()
    .map((path) => {
      const stepIndex = path.steps.findIndex((s) => s.slug === slug);
      if (stepIndex < 0) return null;
      return {
        path,
        stepIndex,
        nextSteps: path.steps.slice(stepIndex + 1, stepIndex + 3),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.nextSteps.length > 0);
}
