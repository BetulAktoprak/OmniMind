export type JournalListItem = {
  id: string;
  title: string | null;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JournalInsightToSave = {
  comment: string;
  musicSuggestion: string;
};

export type JournalDetail = {
  id: string;
  title: string | null;
  mood: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  aiComment: string | null;
  aiMusicSuggestion: string | null;
  aiInsightGeneratedAt: string | null;
};

export type PagedJournalList = {
  items: JournalListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type CreateJournalPayload = {
  title?: string | null;
  mood?: string | null;
  body: string;
  /** Sunucuda kayıtlı tutulur; yoksa gönderme. */
  insight?: JournalInsightToSave | null;
};

export type JournalDraftInsight = {
  comment: string;
  musicSuggestion: string;
};
