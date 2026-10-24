// The light/dark theme lives on <html data-theme>. The inline script in the
// root layout sets it before the first paint: the visitor's saved choice, or
// the system's. Until the visitor picks one with the header key, the page
// keeps following the system; once picked, the choice is saved and wins.
"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** localStorage key of the visitor's choice (read by the layout's script too). */
export const THEME_KEY = "data-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function savedChoice(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/**
 * The theme on screen and a way to change it. Renders "light" on the server
 * and before hydration, then the real one.
 */
export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(current());
    const media = window.matchMedia(DARK_QUERY);
    const followSystem = () => {
      if (savedChoice()) return;
      const next: Theme = media.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setThemeState(next);
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode: the choice holds for this page only.
    }
    setThemeState(next);
  };

  return [theme, setTheme];
}
