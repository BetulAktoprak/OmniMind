export type JournalListItem = {
  id: string;
  title: string | null;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JournalDetail = {
  id: string;
  title: string | null;
  mood: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
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
};
