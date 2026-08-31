import { useEffect, useState } from "react";
import { useThemeStore, type ThemeMode } from "#stores/theme";

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveThemeMode(mode: ThemeMode, systemDark: boolean): "light" | "dark" {
  if (mode === "system") {
    return systemDark ? "dark" : "light";
  }
  return mode;
}

export function useResolvedTheme() {
  const mode = useThemeStore((state) => state.mode);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  return resolveThemeMode(mode, systemDark);
}
