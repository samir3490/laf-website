"use client";

import { PlayfulBackdrop } from "@/components/theme/PlayfulBackdrop";
import { PlayfulBackdropSoft } from "@/components/theme/PlayfulBackdropSoft";
import { ThemePreviewBar } from "@/components/theme/ThemePreviewBar";
import {
  THEME_PREVIEW_KEY,
  THEME_STORAGE_KEY,
  isPreviewTheme,
  parseThemeParam,
  type SiteTheme,
} from "@/lib/theme";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "classic";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "playful-soft" || stored === "playful") return stored;
  return "classic";
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("theme-playful", theme === "playful");
  document.documentElement.classList.toggle("theme-playful-soft", theme === "playful-soft");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [theme, setTheme] = useState<SiteTheme>("classic");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const paramTheme = parseThemeParam(searchParams.get("theme"));
    const stored = readStoredTheme();
    const nextTheme = paramTheme ?? stored;

    applyTheme(nextTheme);
    setTheme(nextTheme);

    if (isPreviewTheme(nextTheme)) {
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
    }

    setReady(true);
  }, [searchParams, pathname]);

  const setSiteTheme = (next: SiteTheme) => {
    if (next === "classic") {
      localStorage.setItem(THEME_STORAGE_KEY, "classic");
      sessionStorage.removeItem(THEME_PREVIEW_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
    }
    applyTheme(next);
    setTheme(next);

    const url = new URL(window.location.href);
    if (next === "classic") {
      url.searchParams.delete("theme");
    } else {
      url.searchParams.set("theme", next);
    }
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  };

  return (
    <>
      {ready && theme === "playful" && <PlayfulBackdrop />}
      {ready && theme === "playful-soft" && <PlayfulBackdropSoft />}
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
      {ready && (
        <ThemePreviewBar theme={theme} onThemeChange={setSiteTheme} pathname={pathname} />
      )}
    </>
  );
}
