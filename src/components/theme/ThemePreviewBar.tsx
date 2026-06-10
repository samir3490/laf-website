"use client";

import Link from "next/link";
import { themeLabel, type SiteTheme } from "@/lib/theme";

type ThemePreviewBarProps = {
  theme: SiteTheme;
  onThemeChange: (theme: SiteTheme) => void;
  pathname: string;
};

export function ThemePreviewBar({ theme, onThemeChange, pathname }: ThemePreviewBarProps) {
  const isPreviewRoute = pathname.startsWith("/preview/learning-theme");
  const isPreview = theme !== "classic";

  if (!isPreview && !isPreviewRoute) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white/95 text-laf-navy backdrop-blur-md shadow-[0_-8px_30px_rgba(15,61,92,0.12)]"
      role="region"
      aria-label="Theme preview controls"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-semibold text-laf-navy">
            Preview: {theme === "classic" ? "Choose a theme below" : themeLabel(theme)}
          </p>
          <p className="text-laf-muted text-xs sm:text-sm mt-0.5">
            Only you see this. Everyone else still gets the classic website until you approve a launch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onThemeChange("classic")}
            className="rounded-lg border border-laf-navy/30 px-4 py-2 text-sm font-semibold hover:bg-laf-cream transition-colors"
          >
            Revert to classic
          </button>
          {theme !== "playful-soft" && (
            <button
              type="button"
              onClick={() => onThemeChange("playful-soft")}
              className="rounded-lg bg-sky-100 text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-200 transition-colors"
            >
              Try soft white
            </button>
          )}
          <Link
            href="/"
            className="rounded-lg bg-laf-gold px-4 py-2 text-sm font-semibold text-white hover:bg-laf-gold-bright transition-colors"
          >
            Browse site
          </Link>
        </div>
      </div>
    </div>
  );
}
