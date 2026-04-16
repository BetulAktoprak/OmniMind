import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { darkColors, lightColors, type ThemePalette } from "./palette";

const STORAGE_KEY = "@omnimind/theme-mode";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemePalette;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    void (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === "light" || v === "dark") setModeState(v);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    void AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      void AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = useMemo(
    () => (mode === "dark" ? darkColors : lightColors),
    [mode],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors,
      setMode,
      toggleMode,
      isDark: mode === "dark",
    }),
    [mode, colors, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useOmniTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useOmniTheme must be used within ThemeProvider");
  }
  return ctx;
}
