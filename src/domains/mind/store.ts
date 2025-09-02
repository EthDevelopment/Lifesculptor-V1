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
    (set) => ({
      // --- initial state
      journal: {},
      ideas: {},

      // --- focus
      focusSessions: {},
      activeFocus: undefined,

      // --- journaling
      upsertJournal: (date: string, body: string) => {
        const entry: JournalEntry = {
          date,
          body,
          updatedAt: Date.now(),
        };
        set((state) => ({
          journal: { ...state.journal, [date]: entry },
        }));
      },

      removeJournal: (date: string) => {
        set((state) => {
          const next = { ...state.journal };
          delete next[date];
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
        set((state) => ({
          ideas: { ...state.ideas, [id]: idea },
        }));
        return id;
      },

      updateIdea: (id, patch) => {
        set((state) => {
          const existing = state.ideas[id];
          if (!existing) return { ideas: state.ideas };
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

          // advance counters within current phase
          const delta = secondsElapsed - rt.secondsElapsed;
          if (phase === "work") {
            secondsWorked = Math.min(secondsWorked + delta, totalSeconds);
          } else {
            secondsOnBreak = Math.min(secondsOnBreak + delta, totalSeconds);
          }

          // handle phase transitions (supports large ticks)
          while (
            secondsElapsed >= phaseEndsAt &&
            secondsElapsed < totalSeconds
          ) {
            if (phase === "work") {
              // switch to break
              phase = "break";
              phaseEndsAt = Math.min(
                phaseEndsAt + rt.config.breakMinutes * 60,
                totalSeconds
              );
            } else {
              // switch back to work; next work block ends at current time + breakEvery
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
      name: "ls-mind", // keep version at 1 to avoid migrate warnings
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
