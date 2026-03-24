import { useLocalSearchParams } from "expo-router";

/** Expo Router dinamik segmenti bazen string | string[] döner. */
export function useRouteId(paramName = "id"): string | undefined {
  const params = useLocalSearchParams<
    Record<string, string | string[] | undefined>
  >();
  const raw = params[paramName];
  if (raw == null) return undefined;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
