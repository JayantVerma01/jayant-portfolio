"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => {} });

/** Runs before first paint (inlined in <head>) so there is no theme flash. */
export const THEME_KEY = "jv-theme";

export const themeInitScript = `(function(){var t='light';try{var s=localStorage.getItem('${THEME_KEY}');if(s==='dark'||s==='light')t=s}catch(e){}document.documentElement.setAttribute('data-theme',t)})()`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // Sync React state with the attribute set by the init script.
    const id = setTimeout(() => setTheme(current === "dark" ? "dark" : "light"), 0);
    return () => clearTimeout(id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
