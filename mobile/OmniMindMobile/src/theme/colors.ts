/**
 * OmniMind — krem zemin, düşük doygunluklu sage yeşili (gözü yormayan).
 */
export const colors = {
  /** Ana zemin: hafif yeşilimsi krem */
  background: "#ebede6",

  /** Ana CTA — tozlu sage, parlak yeşil değil */
  primary: "#6d8068",
  primaryPressed: "#5e6f59",

  /** Krem/sage üzerinde ana metin (koyu zeytin) */
  textOnDark: "rgba(40, 46, 38, 0.94)",
  mutedOnDark: "rgba(88, 96, 80, 0.88)",
  subtleOnDark: "rgba(105, 114, 98, 0.72)",
  footerOnDark: "rgba(120, 128, 112, 0.68)",

  /** Sage buton üzeri */
  textOnPrimary: "rgba(252, 251, 247, 0.98)",
  hintOnPrimary: "rgba(240, 244, 236, 0.88)",

  /** Yüzey / çerçeve (açık temada frost + hafif çizgi) */
  white06: "rgba(255, 255, 255, 0.78)",
  white05: "rgba(255, 255, 255, 0.48)",
  white08: "rgba(72, 82, 66, 0.10)",
  white10: "rgba(72, 82, 66, 0.14)",
  white12: "rgba(255, 255, 255, 0.55)",
  white16: "rgba(72, 82, 66, 0.18)",
  white45: "rgba(95, 104, 88, 0.62)",
  white58: "rgba(88, 96, 82, 0.72)",
  white70: "rgba(105, 114, 98, 0.70)",
  white80: "rgba(52, 58, 48, 0.78)",
  white84: "rgba(48, 54, 44, 0.84)",
  white86: "rgba(42, 48, 38, 0.86)",
  white88: "rgba(40, 46, 36, 0.88)",
  white90: "rgba(38, 44, 36, 0.90)",

  /** Arka plan blob’ları — çok hafif yeşil sis */
  blobTint: "rgba(130, 152, 118, 0.22)",
  blobTint2: "rgba(205, 216, 196, 0.50)",

  /** Form kartı (giriş/kayıt) */
  cardBackground: "rgba(252, 251, 248, 0.98)",
  cardBorder: "rgba(95, 112, 90, 0.22)",
  textOnLight: "rgba(38, 44, 36, 0.96)",
  labelOnLight: "rgba(38, 44, 36, 0.9)",
  mutedOnLight: "rgba(88, 96, 80, 0.9)",
  consentOnLight: "rgba(48, 55, 44, 0.92)",
  inputBackground: "#f5f6f1",
  inputBorder: "rgba(95, 112, 90, 0.22)",
  placeholderOnLight: "rgba(95, 104, 88, 0.45)",

  error: "#9b4a44",

  accentDot: "#7a8f72",

  softSlate: "rgba(120, 135, 110, 0.16)",
  softSlate2: "rgba(120, 135, 110, 0.09)",
} as const;

export const fonts = {
  title: "Inter_800ExtraBold",
  semi: "Inter_600SemiBold",
  reg: "Inter_400Regular",
} as const;
