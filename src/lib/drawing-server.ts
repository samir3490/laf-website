import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { normalizeDrawingEntry, type DrawingEntry } from "@/lib/drawing";

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const ts = value as Timestamp;
  if (typeof ts.toDate === "function") {
    return ts.toDate().toISOString();
  }
  return undefined;
}

/** Public gallery entry — no parent contact info or judge scores. */
export function normalizeDrawingEntryForApi(
  id: string,
  data: DocumentData | undefined
): DrawingEntry | null {
  const entry = normalizeDrawingEntry((data ?? {}) as Record<string, unknown>, id);
  if (!entry || entry.status !== "active") return null;

  const { judgeScore: _judgeScore, ...publicFields } = entry;
  return {
    ...publicFields,
    createdAt: timestampToIso(data?.createdAt),
  };
}
