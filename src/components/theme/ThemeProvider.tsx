"use client";

import { PlayfulBackdrop } from "@/components/theme/PlayfulBackdrop";
import { ThemePreviewBar } from "@/components/theme/ThemePreviewBar";
import {
  THEME_PREVIEW_KEY,
  THEME_STORAGE_KEY,
  isPreviewTheme,
  normalizeTheme,
  parseThemeParam,
  type SiteTheme,
} from "@/lib/theme";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "classic";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "playful-soft" || stored === "playful") return normalizeTheme(stored);
  if (stored === "classic") return "classic";
  return "classic";
}

function applyTheme(theme: SiteTheme) {
  const active = normalizeTheme(theme);
  document.documentElement.dataset.theme = active;
  document.documentElement.classList.toggle("theme-playful", active === "playful");
  document.documentElement.classList.remove("theme-playful-soft");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [theme, setTheme] = useState<SiteTheme>("classic");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const paramTheme = parseThemeParam(searchParams.get("theme"));
    const stored = readStoredTheme();
    const nextTheme = normalizeTheme(paramTheme ?? stored);

    applyTheme(nextTheme);
    setTheme(nextTheme);

    if (isPreviewTheme(nextTheme)) {
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
      if (searchParams.get("theme") === "playful-soft") {
        const url = new URL(window.location.href);
        url.searchParams.set("theme", "playful");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    }

    setReady(true);
  }, [searchParams, pathname]);

  const setSiteTheme = (next: SiteTheme) => {
    const active = normalizeTheme(next);
    if (active === "classic") {
      localStorage.setItem(THEME_STORAGE_KEY, "classic");
      sessionStorage.removeItem(THEME_PREVIEW_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, active);
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
    }
    applyTheme(active);
    setTheme(active);

    const url = new URL(window.location.href);
    if (active === "classic") {
      url.searchParams.delete("theme");
    } else {
      url.searchParams.set("theme", active);
    }
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  };

  return (
    <>
      {ready && theme === "playful" && <PlayfulBackdrop />}
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
      {ready && (
        <ThemePreviewBar theme={theme} onThemeChange={setSiteTheme} pathname={pathname} />
      )}
    </>
  );
}
