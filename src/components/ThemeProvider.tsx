"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "veewoo-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const hasSavedTheme = savedTheme === "dark" || savedTheme === "light";
    const initialTheme = hasSavedTheme
      ? savedTheme
      : getSystemTheme();

    // The startup script has already applied the class; this syncs React state
    // with that external browser state after the client has mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    if (!hasSavedTheme) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = (event: MediaQueryListEvent) => {
        const nextTheme = event.matches ? "dark" : "light";
        setThemeState(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: (nextTheme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    },
    toggleTheme: () => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      setThemeState(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
