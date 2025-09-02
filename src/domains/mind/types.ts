// src/domains/mind/types.ts

export type JournalEntry = {
  id: string; // unique id
  date: string; // YYYY-MM-DD (local)
  body: string;
  mood?: number; // 1-10
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

export type Idea = {
  id: string;
  title: string; // one-liner
  details?: string; // optional expanded text
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

/** Focus / Pomodoro */
export type FocusPhase = "work" | "break";

export type FocusConfig = {
  label: string; // what are we working on
  totalMinutes: number; // total session duration
  breakEvery: number; // minutes between breaks (work block length)
  breakMinutes: number; // each break duration in minutes
};

export type FocusRuntime = {
  id: string;
  config: FocusConfig;
  startedAt: number; // epoch ms
  phase: FocusPhase; // "work" | "break"
  secondsElapsed: number;
  secondsWorked: number;
  secondsOnBreak: number;
  phaseEndsAt: number; // absolute "secondsElapsed" when current phase ends
  isPaused: boolean;
};

export type FocusSession = {
  id: string;
  label: string;
  startedAt: number; // epoch ms
  endedAt: number; // epoch ms
  secondsWorked: number;
  secondsOnBreak: number;
  notes?: string;
};

export type MindState = {
  // Journaling (multi-entry per day)
  journal: Record<string, JournalEntry>; // keyed by entry id
  addJournalEntry: (date: string, body: string, mood?: number) => string;
  updateJournalEntry: (
    id: string,
    patch: Partial<Pick<JournalEntry, "body" | "mood" | "date">>
  ) => void;
  removeJournalEntry: (id: string) => void;
  // Back-compat helpers
  upsertJournal: (date: string, body: string) => void; // adds a new entry
  removeJournal: (date: string) => void; // removes all entries for date

  // Ideas
  ideas: Record<string, Idea>;
  addIdea: (title: string, details?: string) => string;
  updateIdea: (
    id: string,
    patch: Partial<Pick<Idea, "title" | "details">>
  ) => void;
  deleteIdea: (id: string) => void;

  // Focus / Pomodoro
  focusSessions: Record<string, FocusSession>;
  activeFocus?: FocusRuntime;

  startFocus: (config?: Partial<FocusConfig>) => string; // returns id
  pauseFocus: () => void;
  resumeFocus: () => void;
  tickFocus: (seconds?: number) => void; // advance runtime clock; default 1s
  endFocus: (extra?: { notes?: string }) => void; // flush to history
  cancelFocus: () => void; // drop without logging
  addFocusNote: (id: string, notes: string) => void; // edit history item
};
