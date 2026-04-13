import { useLocalSearchParams } from "expo-router";

/** Expo Router dinamik segmenti bazen string | string[] döner. */
export function useRouteId(paramName = "id"): string | undefined {
  const params = useLocalSearchParams();
  const raw = params[paramName as keyof typeof params];
  if (raw == null) return undefined;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
