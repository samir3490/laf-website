export type ScratchGame = {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  authorId: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
};

export function parseScratchProjectId(input: string): string | null {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/scratch\.mit\.edu\/projects\/(\d+)/i);
  return match ? match[1] : null;
}

export function scratchEmbedUrl(projectId: string): string {
  return `https://scratch.mit.edu/projects/${projectId}/embed`;
}

export function scratchProjectUrl(projectId: string): string {
  return `https://scratch.mit.edu/projects/${projectId}/`;
}

export function scratchEmbedCode(projectId: string): string {
  const src = scratchEmbedUrl(projectId);
  return `<iframe src="${src}" width="485" height="402" allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
}

export function formatGameDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
