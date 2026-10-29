"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = "system" | "light" | "dark";
export type Density = "comfortable" | "compact";

type Ctx = {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  toggle: () => void;
  density: Density;
  setDensity: (d: Density) => void;
};
const ThemeCtx = createContext<Ctx | null>(null);

function apply(t: ThemePref) {
  const el = document.documentElement;
  if (t === "system") delete el.dataset.theme;
  else el.dataset.theme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePref>("system");
  const [density, setDensityState] = useState<Density>("comfortable");

  useEffect(() => {
    try {
      const t = localStorage.getItem("pp-theme");
      if (t === "light" || t === "dark") setThemeState(t);
      if (localStorage.getItem("pp-density") === "compact") setDensityState("compact");
    } catch {}
  }, []);

  const setTheme = useCallback((t: ThemePref) => {
    setThemeState(t);
    apply(t);
    try {
      if (t === "system") localStorage.removeItem("pp-theme");
      else localStorage.setItem("pp-theme", t);
    } catch {}
  }, []);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
    if (d === "compact") document.documentElement.dataset.density = "compact";
    else delete document.documentElement.dataset.density;
    try {
      localStorage.setItem("pp-density", d);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggle, density, setDensity }), [theme, setTheme, toggle, density, setDensity]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme outside ThemeProvider");
  return c;
}
