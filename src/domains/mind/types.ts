// src/domains/mind/types.ts
export type JournalEntry = {
  /** ISO date 'YYYY-MM-DD' used as the key */
  date: string;
  body: string;
  updatedAt: number; // epoch ms
};

export type Idea = {
  id: string;
  title: string; // one-liner, e.g., "a hat for cats"
  details?: string; // optional expanded text
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

export type MindState = {
  // Journaling
  journal: Record<string, JournalEntry>;
  upsertJournal: (date: string, body: string) => void;
  removeJournal: (date: string) => void;

  // Ideas
  ideas: Record<string, Idea>;
  addIdea: (title: string, details?: string) => string;
  updateIdea: (
    id: string,
    patch: Partial<Pick<Idea, "title" | "details">>
  ) => void;
  deleteIdea: (id: string) => void;
};
