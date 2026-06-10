export type SiteTheme = "classic" | "playful" | "playful-soft";

export const THEME_STORAGE_KEY = "laf-theme";
export const THEME_PREVIEW_KEY = "laf-theme-preview-session";

/** playful-soft is kept for old links; it maps to the colorful gutter theme. */
export function normalizeTheme(theme: SiteTheme): SiteTheme {
  return theme === "playful-soft" ? "playful" : theme;
}

export function isPreviewTheme(theme: SiteTheme): boolean {
  return normalizeTheme(theme) === "playful";
}

export function parseThemeParam(value: string | null | undefined): SiteTheme | null {
  if (value === "playful" || value === "playful-soft") return "playful";
  if (value === "classic") return "classic";
  return null;
}

export function themeLabel(theme: SiteTheme): string {
  if (normalizeTheme(theme) === "playful") return "Warm learning theme";
  return "Classic";
}
