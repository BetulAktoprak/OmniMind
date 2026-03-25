import { isAxiosError } from "axios";
import { http } from "./http";
import { ApiError } from "./apiError";
import type {
  CreateJournalPayload,
  JournalDetail,
  JournalListItem,
  PagedJournalList,
} from "../types/journal";

function msg(e: unknown): string {
  const ax = e as { response?: { data?: { message?: string } } };
  return ax?.response?.data?.message ?? "Bir hata oluştu.";
}

function rethrow(e: unknown): never {
  if (isAxiosError(e)) {
    throw new ApiError(msg(e), e.response?.status);
  }
  throw e instanceof Error ? e : new Error(String(e));
}

function normItem(raw: Record<string, unknown>): JournalListItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    title: (raw.title ?? raw.Title ?? null) as string | null,
    mood: (raw.mood ?? raw.Mood ?? null) as string | null,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.UpdatedAt ?? ""),
  };
}

function normPaged(raw: Record<string, unknown>): PagedJournalList {
  const itemsRaw = (raw.items ?? raw.Items ?? []) as Record<string, unknown>[];
  return {
    items: itemsRaw.map(normItem),
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? 0),
    page: Number(raw.page ?? raw.Page ?? 1),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? 20),
  };
}

function normDetail(raw: Record<string, unknown>): JournalDetail {
  const genAt = raw.aiInsightGeneratedAt ?? raw.AiInsightGeneratedAt;
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    title: (raw.title ?? raw.Title ?? null) as string | null,
    mood: (raw.mood ?? raw.Mood ?? null) as string | null,
    body: String(raw.body ?? raw.Body ?? ""),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.UpdatedAt ?? ""),
    aiComment: (raw.aiComment ?? raw.AiComment ?? null) as string | null,
    aiMusicSuggestion: (raw.aiMusicSuggestion ?? raw.AiMusicSuggestion ?? null) as string | null,
    aiInsightGeneratedAt:
      genAt == null || genAt === "" ? null : String(genAt),
  };
}

export async function createJournal(payload: CreateJournalPayload): Promise<string> {
  try {
    const req: Record<string, unknown> = {
      title: payload.title ?? null,
      mood: payload.mood ?? null,
      body: payload.body,
    };
    if (payload.insight) {
      req.insight = {
        comment: payload.insight.comment,
        musicSuggestion: payload.insight.musicSuggestion,
      };
    }
    const { data } = await http.post<Record<string, unknown>>("/api/Journal/Create", req);
    const id = data.id ?? data.Id;
    if (id == null) throw new ApiError("Sunucu yanıtı geçersiz.");
    return String(id);
  } catch (e) {
    rethrow(e);
  }
}

export async function listJournals(
  page = 1,
  pageSize = 20
): Promise<PagedJournalList> {
  try {
    const { data } = await http.get<Record<string, unknown>>("/api/Journal/List", {
      params: { page, pageSize },
    });
    return normPaged(data);
  } catch (e) {
    rethrow(e);
  }
}

export async function getJournal(id: string): Promise<JournalDetail> {
  try {
    const { data } = await http.get<Record<string, unknown>>("/api/Journal/GetById", {
      params: { id },
    });
    return normDetail(data);
  } catch (e) {
    rethrow(e);
  }
}

export async function updateJournal(
  id: string,
  payload: CreateJournalPayload
): Promise<void> {
  try {
    const req: Record<string, unknown> = {
      title: payload.title ?? null,
      mood: payload.mood ?? null,
      body: payload.body,
    };
    if (payload.insight) {
      req.insight = {
        comment: payload.insight.comment,
        musicSuggestion: payload.insight.musicSuggestion,
      };
    }
    await http.put("/api/Journal/Update", req, { params: { id } });
  } catch (e) {
    rethrow(e);
  }
}

export async function deleteJournal(id: string): Promise<void> {
  try {
    await http.delete("/api/Journal/Delete", { params: { id } });
  } catch (e) {
    rethrow(e);
  }
}
