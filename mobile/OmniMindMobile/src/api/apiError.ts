import { isAxiosError } from "axios";

/** Axios hatalarını journal.api içinde sarmalarken HTTP kodunu korur (ör. 401). */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (isAxiosError(e)) {
    const m = e.response?.data as { message?: string } | undefined;
    return m?.message ?? e.message ?? "Bir hata oluştu.";
  }
  return e instanceof Error ? e.message : "Bir hata oluştu.";
}

/** ASP.NET Core ProblemDetails + `errors` sözlüğü (model state) dahil. */
export function getAspNetApiErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (!isAxiosError(e)) return e instanceof Error ? e.message : "Bir hata oluştu.";

  const data = e.response?.data as
    | { message?: string; errors?: Record<string, string[] | string> }
    | undefined;

  if (data?.message && typeof data.message === "string") return data.message;

  if (data?.errors && typeof data.errors === "object") {
    const lines: string[] = [];
    for (const v of Object.values(data.errors)) {
      if (Array.isArray(v)) lines.push(...v.filter((x) => typeof x === "string"));
      else if (typeof v === "string") lines.push(v);
    }
    if (lines.length > 0) return lines.join("\n");
  }

  if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
    return "Sunucuya ulaşılamıyor. API adresini ve internet bağlantını kontrol et.";
  }

  return e.message || "Bir hata oluştu.";
}
