import { icon } from "./iconPalette";

/** Açık kart üzeri çerçeve / metin (lacivert mürekkep) */
const ink = { r: 22, g: 42, b: 62 } as const;

export type ThemePalette = {
  icon: typeof icon;
  background: string;
  primary: string;
  primaryPressed: string;
  textOnPrimary: string;
  hintOnPrimary: string;
  textOnDark: string;
  mutedOnDark: string;
  subtleOnDark: string;
  footerOnDark: string;
  white06: string;
  white05: string;
  white08: string;
  white10: string;
  white12: string;
  white16: string;
  white45: string;
  white58: string;
  white70: string;
  white80: string;
  white84: string;
  white86: string;
  white88: string;
  white90: string;
  cardBackground: string;
  cardBorder: string;
  textOnLight: string;
  labelOnLight: string;
  mutedOnLight: string;
  consentOnLight: string;
  inputBackground: string;
  inputBorder: string;
  placeholderOnLight: string;
  error: string;
  accentDot: string;
  spark: string;
  softSlate: string;
  softSlate2: string;
};

export const darkColors: ThemePalette = {
  icon,

  background: icon.night,

  primary: icon.gold,
  primaryPressed: icon.goldDeep,

  textOnPrimary: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.96)`,
  hintOnPrimary: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.62)`,

  textOnDark: "rgba(248, 250, 252, 0.94)",
  mutedOnDark: "rgba(186, 200, 222, 0.88)",
  subtleOnDark: "rgba(148, 163, 184, 0.78)",
  footerOnDark: "rgba(148, 163, 184, 0.65)",

  white06: "rgba(255, 255, 255, 0.10)",
  white05: "rgba(255, 255, 255, 0.06)",
  white08: "rgba(255, 255, 255, 0.12)",
  white10: "rgba(255, 255, 255, 0.14)",
  white12: "rgba(255, 255, 255, 0.16)",
  white16: "rgba(255, 255, 255, 0.22)",
  white45: "rgba(255, 255, 255, 0.45)",
  white58: "rgba(255, 255, 255, 0.58)",
  white70: "rgba(255, 255, 255, 0.70)",
  white80: "rgba(255, 255, 255, 0.80)",
  white84: "rgba(255, 255, 255, 0.84)",
  white86: "rgba(255, 255, 255, 0.86)",
  white88: "rgba(255, 255, 255, 0.88)",
  white90: "rgba(255, 255, 255, 0.90)",

  cardBackground: "rgba(255, 255, 255, 0.97)",
  cardBorder: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.12)`,
  textOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.94)`,
  labelOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.9)`,
  mutedOnLight: "rgba(75, 90, 112, 0.88)",
  consentOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.88)`,
  inputBackground: "#f4f7fc",
  inputBorder: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.14)`,
  placeholderOnLight: "rgba(95, 110, 130, 0.45)",

  error: "#f87171",

  accentDot: icon.yellowBright,
  spark: icon.yellowBright,

  softSlate: "rgba(255, 255, 255, 0.08)",
  softSlate2: "rgba(252, 229, 102, 0.22)",
};

/** Açık tema: lacivert yıkamalı zemin (daha az parlaklık), kartlar saf beyaz değil */
export const lightColors: ThemePalette = {
  icon,

  /** Gece mavisi (#0f1f38) ile uyumlu, gözü yormayan soğuk gri-mavi */
  background: "#dfe7f3",

  primary: icon.gold,
  primaryPressed: icon.goldDeep,

  textOnPrimary: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.96)`,
  hintOnPrimary: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.62)`,

  textOnDark: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.92)`,
  mutedOnDark: "rgba(70, 85, 110, 0.88)",
  subtleOnDark: "rgba(95, 110, 130, 0.72)",
  footerOnDark: "rgba(95, 110, 130, 0.58)",

  white06: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.06)`,
  white05: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.04)`,
  white08: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.10)`,
  white10: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.12)`,
  white12: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.14)`,
  white16: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.18)`,
  white45: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.45)`,
  white58: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.58)`,
  white70: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.70)`,
  white80: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.80)`,
  white84: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.84)`,
  white86: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.86)`,
  white88: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.88)`,
  white90: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.90)`,

  cardBackground: "#ffffff",
  cardBorder: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.12)`,
  textOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.94)`,
  labelOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.9)`,
  mutedOnLight: "rgba(75, 90, 112, 0.88)",
  consentOnLight: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.88)`,
  inputBackground: "#fafcff",
  inputBorder: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.14)`,
  placeholderOnLight: "rgba(95, 110, 130, 0.45)",

  error: "#dc2626",

  accentDot: icon.yellowBright,
  spark: icon.goldDeep,

  softSlate: `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.09)`,
  softSlate2: "rgba(230, 188, 46, 0.26)",
};
