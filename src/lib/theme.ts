export type SiteTheme = "classic" | "playful";

export const THEME_STORAGE_KEY = "laf-theme";
export const THEME_PREVIEW_KEY = "laf-theme-preview-session";

export function isPlayfulTheme(theme: SiteTheme): boolean {
  return theme === "playful";
}

export function parseThemeParam(value: string | null | undefined): SiteTheme | null {
  if (value === "playful" || value === "classic") return value;
  return null;
}
