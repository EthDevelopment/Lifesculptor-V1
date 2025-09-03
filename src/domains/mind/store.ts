// src/domains/mind/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  MindState,
  JournalEntry,
  Idea,
  FocusConfig,
  FocusRuntime,
  FocusSession,
} from "./types";

export const useMindStore = create<MindState>()(
  persist(
    (set, get) => ({
      // --- initial state
      journal: {}, // keyed by entry id
      ideas: {},

      // --- focus
      focusSessions: {},
      activeFocus: undefined,

      // --- journaling (multi-entry per day)
      addJournalEntry: (date: string, body: string, mood?: number) => {
        const id = nanoid();
        const now = Date.now();
        const entry: JournalEntry = {
          id,
          date,
          body,
          mood,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ journal: { ...state.journal, [id]: entry } }));
        return id;
      },

      updateJournalEntry: (id, patch) => {
        set((state) => {
          const existing = state.journal[id];
          if (!existing) return state;
          const next: JournalEntry = {
            ...existing,
            ...patch,
            body: patch.body !== undefined ? patch.body : existing.body,
            mood: patch.mood !== undefined ? patch.mood : existing.mood,
            date: patch.date !== undefined ? patch.date : existing.date,
            updatedAt: Date.now(),
          };
          return { journal: { ...state.journal, [id]: next } };
        });
      },

      removeJournalEntry: (id) => {
        set((state) => {
          if (!state.journal[id]) return state;
          const next = { ...state.journal };
          delete next[id];
          return { journal: next };
        });
      },

      // --- journaling (back-compat wrappers)
      upsertJournal: (date: string, body: string) => {
        // In the new model, "upsert" just adds a new entry for the date.
        get().addJournalEntry(date, body);
      },

      removeJournal: (date: string) => {
        set((state) => {
          const next = { ...state.journal };
          for (const [id, e] of Object.entries(state.journal)) {
            if (e.date === date) delete next[id];
          }
          return { journal: next };
        });
      },

      // --- ideas
      addIdea: (title: string, details?: string) => {
        const id = nanoid();
        const now = Date.now();
        const idea: Idea = {
          id,
          title: title.trim(),
          details: details?.trim() ? details.trim() : undefined,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ ideas: { ...state.ideas, [id]: idea } }));
        return id;
      },

      updateIdea: (id, patch) => {
        set((state) => {
          const existing = state.ideas[id];
          if (!existing) return { ideas: state.ideas } as any;
          const next: Idea = {
            ...existing,
            ...patch,
            title: (patch.title ?? existing.title).trim(),
            details:
              patch.details !== undefined
                ? patch.details.trim() || undefined
                : existing.details,
            updatedAt: Date.now(),
          };
          return { ideas: { ...state.ideas, [id]: next } };
        });
      },

      deleteIdea: (id) => {
        set((state) => {
          const next = { ...state.ideas };
          delete next[id];
          return { ideas: next };
        });
      },

      // --- focus / pomodoro
      startFocus: (partial?: Partial<FocusConfig>) => {
        const cfg: FocusConfig = {
          label: (partial?.label ?? "Focus").trim(),
          totalMinutes: Math.max(1, Math.min(600, partial?.totalMinutes ?? 25)),
          breakEvery: Math.max(1, Math.min(180, partial?.breakEvery ?? 25)),
          breakMinutes: Math.max(1, Math.min(60, partial?.breakMinutes ?? 5)),
        };
        const id = nanoid();
        const runtime: FocusRuntime = {
          id,
          config: cfg,
          startedAt: Date.now(),
          phase: "work",
          secondsElapsed: 0,
          secondsWorked: 0,
          secondsOnBreak: 0,
          phaseEndsAt: cfg.breakEvery * 60, // first break
          isPaused: false,
        };
        set({ activeFocus: runtime });
        return id;
      },

      pauseFocus: () => {
        set((state) => {
          if (!state.activeFocus || state.activeFocus.isPaused) return state;
          return { activeFocus: { ...state.activeFocus, isPaused: true } };
        });
      },

      resumeFocus: () => {
        set((state) => {
          if (!state.activeFocus || !state.activeFocus.isPaused) return state;
          return { activeFocus: { ...state.activeFocus, isPaused: false } };
        });
      },

      tickFocus: (seconds = 1) => {
        set((state) => {
          const rt = state.activeFocus;
          if (!rt || rt.isPaused) return state;

          const totalSeconds = rt.config.totalMinutes * 60;
          let secondsElapsed = Math.min(
            rt.secondsElapsed + seconds,
            totalSeconds
          );
          let secondsWorked = rt.secondsWorked;
          let secondsOnBreak = rt.secondsOnBreak;
          let phase = rt.phase;
          let phaseEndsAt = rt.phaseEndsAt;

          const delta = secondsElapsed - rt.secondsElapsed;
          if (phase === "work") {
            secondsWorked = Math.min(secondsWorked + delta, totalSeconds);
          } else {
            secondsOnBreak = Math.min(secondsOnBreak + delta, totalSeconds);
          }

          while (
            secondsElapsed >= phaseEndsAt &&
            secondsElapsed < totalSeconds
          ) {
            if (phase === "work") {
              phase = "break";
              phaseEndsAt = Math.min(
                phaseEndsAt + rt.config.breakMinutes * 60,
                totalSeconds
              );
            } else {
              phase = "work";
              phaseEndsAt = Math.min(
                phaseEndsAt + rt.config.breakEvery * 60,
                totalSeconds
              );
            }
          }

          const updated: FocusRuntime = {
            ...rt,
            secondsElapsed,
            secondsWorked,
            secondsOnBreak,
            phase,
            phaseEndsAt,
          };

          return { activeFocus: updated };
        });
      },

      endFocus: (extra) => {
        set((state) => {
          const rt = state.activeFocus;
          if (!rt) return state;

          const endedAt = Date.now();
          const session: FocusSession = {
            id: rt.id,
            label: rt.config.label,
            startedAt: rt.startedAt,
            endedAt,
            secondsWorked: rt.secondsWorked,
            secondsOnBreak: rt.secondsOnBreak,
            notes: extra?.notes?.trim() || undefined,
          };

          return {
            activeFocus: undefined,
            focusSessions: { ...state.focusSessions, [rt.id]: session },
          };
        });
      },

      cancelFocus: () => {
        set((state) =>
          state.activeFocus ? { activeFocus: undefined } : state
        );
      },

      addFocusNote: (id, notes) => {
        set((state) => {
          const existing = state.focusSessions[id];
          if (!existing) return state;
          const next: FocusSession = {
            ...existing,
            notes: notes.trim() || undefined,
          };
          return { focusSessions: { ...state.focusSessions, [id]: next } };
        });
      },
    }),
    {
      name: "ls-mind",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, from) => {
        // v1 -> v2 migration: convert single-entry-per-day journal to multi-entry (by id)
        if (from < 2 && persisted && typeof persisted === "object") {
          const anyObj: any = persisted;
          const old = anyObj.state?.journal || anyObj.journal;
          if (old && typeof old === "object" && !Array.isArray(old)) {
            const now = Date.now();
            const journal: Record<string, JournalEntry> = {};
            for (const [key, val] of Object.entries<any>(old)) {
              const id = nanoid();
              journal[id] = {
                id,
                date: (val as any)?.date || (key as string),
                body: (val as any)?.body || "",
                mood: undefined,
                createdAt: (val as any)?.updatedAt || now,
                updatedAt: (val as any)?.updatedAt || now,
              };
            }
            if (anyObj.state) anyObj.state.journal = journal;
            else anyObj.journal = journal;
          }
        }
        return persisted as any;
      },
    }
  )
);
