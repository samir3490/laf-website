import seedResources from "@/content/library-resources.json";
import {
  normalizeLibraryResource,
  type LibraryResource,
} from "@/lib/library";

export function getSeedLibraryResources(): LibraryResource[] {
  return (seedResources as Record<string, unknown>[])
    .map((item) => normalizeLibraryResource(item))
    .filter((r): r is LibraryResource => r !== null);
}
