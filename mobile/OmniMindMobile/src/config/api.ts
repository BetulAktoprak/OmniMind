import { Platform } from "react-native";

/**
 * Fiziksel cihazda: proje kökünde `.env` oluşturup
 * EXPO_PUBLIC_API_URL=http://192.168.x.x:5068
 * (bilgisayarının LAN IP’si) ver; Metro’yu yeniden başlat.
 */
function trimBase(url: string | undefined): string | undefined {
  const t = url?.trim();
  if (!t) return undefined;
  return t.replace(/\/+$/, "");
}

const fromEnv = trimBase(process.env.EXPO_PUBLIC_API_URL);

export const API_BASE_URL =
  fromEnv ??
  (Platform.OS === "android" ? "http://10.0.2.2:5068" : "http://localhost:5068");
