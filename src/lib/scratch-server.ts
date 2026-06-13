import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import type { ScratchGame } from "@/lib/scratch";

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const ts = value as Timestamp;
  if (typeof ts.toDate === "function") {
    return ts.toDate().toISOString();
  }
  return undefined;
}

export function normalizeScratchGame(id: string, data: DocumentData | undefined): ScratchGame | null {
  if (!data?.title || !data?.projectId || !data?.authorId) return null;

  return {
    id,
    title: String(data.title),
    description: data.description ? String(data.description) : undefined,
    projectId: String(data.projectId),
    authorId: String(data.authorId),
    authorName: String(data.authorName ?? "Anonymous"),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}
