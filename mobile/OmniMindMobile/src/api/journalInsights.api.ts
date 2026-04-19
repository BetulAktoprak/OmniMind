import { isAxiosError } from "axios";
import { http } from "./http";
import { ApiError, getAspNetApiErrorMessage } from "./apiError";
import type { JournalDraftInsight } from "../types/journal";

function rethrow(e: unknown): never {
  if (isAxiosError(e)) {
    throw new ApiError(getAspNetApiErrorMessage(e), e.response?.status);
  }
  throw e instanceof Error ? e : new Error(String(e));
}

function normInsight(raw: Record<string, unknown>): JournalDraftInsight {
  return {
    comment: String(raw.comment ?? raw.Comment ?? ""),
    musicSuggestion: String(
      raw.musicSuggestion ?? raw.MusicSuggestion ?? ""
    ),
  };
}

export async function analyzeJournalDraft(
  body: string,
  mood: string | null
): Promise<JournalDraftInsight> {
  try {
    const { data } = await http.post<Record<string, unknown>>(
      "/api/Journal/AnalyzeDraft",
      { body, mood }
    );
    return normInsight(data);
  } catch (e) {
    rethrow(e);
  }
}
