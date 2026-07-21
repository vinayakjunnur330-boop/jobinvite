import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "theme";

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
}

export function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch { /* ignore */ }
  return "dark";
}

export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    const t = readTheme();
    setThemeState(t);
    applyTheme(t);
  }, []);
  const setTheme = (t: Theme) => { setThemeState(t); applyTheme(t); };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return [theme, setTheme, toggle];
}

export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}`;
