export type SiteTheme = "classic" | "playful" | "playful-soft";

export const THEME_STORAGE_KEY = "laf-theme";
export const THEME_PREVIEW_KEY = "laf-theme-preview-session";

export function isPreviewTheme(theme: SiteTheme): boolean {
  return theme === "playful" || theme === "playful-soft";
}

export function parseThemeParam(value: string | null | undefined): SiteTheme | null {
  if (value === "playful" || value === "playful-soft" || value === "classic") return value;
  return null;
}

export function themeLabel(theme: SiteTheme): string {
  if (theme === "playful-soft") return "Soft white learning theme";
  if (theme === "playful") return "Colorful learning theme (v1)";
  return "Classic";
}
