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
