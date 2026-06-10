import type { LibrarySubmission } from "@/lib/library";

export function contributorDocId(sub: Pick<LibrarySubmission, "submitterEmail" | "contributorDisplayName">): string {
  if (sub.submitterEmail?.trim()) {
    const normalized = sub.submitterEmail.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
    }
    return `email-${hash.toString(36)}`;
  }
  return "community";
}

export function contributorDisplayLabel(
  sub: Pick<LibrarySubmission, "submitterEmail" | "contributorDisplayName">
): string {
  const custom = sub.contributorDisplayName?.trim();
  if (custom) return custom.slice(0, 40);

  const email = sub.submitterEmail?.trim();
  if (email) {
    const local = email.split("@")[0] ?? "member";
    if (local.length <= 2) return `${local}***`;
    return `${local.slice(0, 2)}***`;
  }

  return "Community member";
}
