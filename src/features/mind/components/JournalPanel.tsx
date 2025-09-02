import { useMemo, useState } from "react";
import { useMindStore } from "@/domains/mind/store";

export default function JournalPanel() {
  // today's ISO date
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(today);
  const [body, setBody] = useState<string>("");

  const journal = useMindStore((s) => s.journal);
  const upsertJournal = useMindStore((s) => s.upsertJournal);
  const removeJournal = useMindStore((s) => s.removeJournal);

  // Load entry when date changes or store changes
  useMemo(() => {
    setBody(journal[date]?.body ?? "");
  }, [date, journal]);

  const entry = journal[date];

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-neutral-400">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-500"
        />
        {entry ? (
          <span className="text-xs text-neutral-400">
            Saved {new Date(entry.updatedAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-neutral-500">No entry yet</span>
        )}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write freely…"
        rows={10}
        className="w-full rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-neutral-200 placeholder-neutral-500 outline-none focus:border-neutral-600"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => upsertJournal(date, body)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Save
        </button>
        {entry ? (
          <button
            type="button"
            onClick={() => removeJournal(date)}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Delete entry
          </button>
        ) : null}
      </div>
    </div>
  );
}
