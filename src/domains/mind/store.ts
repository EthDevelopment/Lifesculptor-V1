// src/domains/mind/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { MindState, JournalEntry, Idea } from "./types";

export const useMindStore = create<MindState>()(
  persist(
    (set) => ({
      // --- initial state
      journal: {},
      ideas: {},

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
    }),
    {
      name: "ls-mind", // keep version at 1 to avoid migrate warnings
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
