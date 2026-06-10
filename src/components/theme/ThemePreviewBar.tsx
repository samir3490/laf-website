"use client";

import Link from "next/link";
import type { SiteTheme } from "@/lib/theme";

type ThemePreviewBarProps = {
  theme: SiteTheme;
  onThemeChange: (theme: SiteTheme) => void;
  pathname: string;
};

export function ThemePreviewBar({ theme, onThemeChange, pathname }: ThemePreviewBarProps) {
  const isPreviewRoute = pathname.startsWith("/preview/learning-theme");
  const showBar = theme === "playful" || isPreviewRoute;

  if (!showBar) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/20 bg-laf-navy/95 text-white backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
      role="region"
      aria-label="Theme preview controls"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-semibold text-laf-gold-bright">
            Preview: Playful learning theme
          </p>
          <p className="text-white/80 text-xs sm:text-sm mt-0.5">
            Only you see this until we launch it site-wide. Other visitors still get the classic design.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onThemeChange("classic")}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Revert to classic
          </button>
          <button
            type="button"
            onClick={() => onThemeChange("playful")}
            className="rounded-lg bg-laf-gold px-4 py-2 text-sm font-semibold text-white hover:bg-laf-gold-bright transition-colors"
          >
            Keep preview on
          </button>
          <Link
            href="/"
            className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition-colors"
          >
            Browse site
          </Link>
        </div>
      </div>
    </div>
  );
}
