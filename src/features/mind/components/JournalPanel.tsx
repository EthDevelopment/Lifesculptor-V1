// src/features/mind/components/JournalPanel.tsx
import { useMemo, useState } from "react";
import { useMindStore } from "@/domains/mind/store";

export default function JournalPanel() {
  // today's ISO date
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(today);
  const [body, setBody] = useState<string>("");
  const [mood, setMood] = useState<number>(7);

  const journal = useMindStore((s) => s.journal);
  const addJournalEntry = useMindStore((s) => s.addJournalEntry);
  const updateJournalEntry = useMindStore((s) => s.updateJournalEntry);
  const removeJournalEntry = useMindStore((s) => s.removeJournalEntry);

  // entries for selected day (newest first)
  const entries = useMemo(() => {
    return Object.values(journal)
      .filter((e) => e.date === date)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [journal, date]);

  const avgMoodForDay = useMemo(() => {
    const moods = entries
      .map((e) => e.mood)
      .filter((m): m is number => typeof m === "number");
    if (!moods.length) return null;
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    return Number(avg.toFixed(1));
  }, [entries]);

  const save = () => {
    const trimmed = body.trim();
    if (!trimmed && !(mood >= 1 && mood <= 10)) return; // avoid empty entry
    addJournalEntry(date, trimmed, mood);
    setBody("");
    setMood(7);
  };

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
      {/* Header / date */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-neutral-400">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-500"
        />
        <span className="text-xs text-neutral-500">
          {entries.length} entr{entries.length === 1 ? "y" : "ies"}
        </span>
        {avgMoodForDay != null && (
          <span className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
            Avg mood {avgMoodForDay}/10
          </span>
        )}
      </div>

      {/* Mood slider */}
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-3">
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
          <span>Mood</span>
          <span className="font-medium text-neutral-200">{mood}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Entry editor */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write freely…"
        rows={8}
        className="w-full rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-neutral-200 placeholder-neutral-500 outline-none focus:border-neutral-600"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Save entry
        </button>
        {body.trim() && (
          <span className="text-xs text-neutral-500">Unsaved changes</span>
        )}
      </div>

      {/* Day entries list */}
      <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950/40">
        <div className="border-b border-neutral-800 px-4 py-2 text-sm text-neutral-400">
          Entries for {new Date(date).toLocaleDateString()}
        </div>
        {entries.length === 0 ? (
          <div className="p-4 text-sm text-neutral-500">No entries yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {entries.map((e) => (
              <JournalRow
                key={e.id}
                entry={e}
                onUpdate={(patch) => updateJournalEntry(e.id, patch)}
                onDelete={() => removeJournalEntry(e.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function JournalRow({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: {
    id: string;
    date: string;
    body: string;
    mood?: number;
    createdAt: number;
    updatedAt: number;
  };
  onUpdate: (patch: Partial<{ body: string; mood: number }>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(entry.body);
  const [mood, setMood] = useState<number>(entry.mood ?? 7);

  const time = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const save = () => {
    const patch: Partial<{ body: string; mood: number }> = {};
    if (body.trim() !== entry.body) patch.body = body.trim();
    if ((mood ?? undefined) !== (entry.mood ?? undefined)) patch.mood = mood;
    if (Object.keys(patch).length) onUpdate(patch);
    setEditing(false);
  };

  return (
    <li className="grid gap-2 p-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">{time}</span>
          {entry.mood !== undefined && (
            <span className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
              Mood {entry.mood}/10
            </span>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 p-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
              placeholder="Edit entry…"
            />
            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                <span>Mood</span>
                <span className="font-medium text-neutral-200">{mood}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setBody(entry.body);
                  setMood(entry.mood ?? 7);
                  setEditing(false);
                }}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">
            {entry.body || (
              <span className="italic text-neutral-500">(no text)</span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-md border border-red-700/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900/20"
            >
              Delete
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}
