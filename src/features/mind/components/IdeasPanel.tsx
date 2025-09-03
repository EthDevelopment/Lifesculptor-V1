import { useMemo, useState } from "react";
import { useMindStore } from "@/domains/mind/store";

export default function IdeasPanel() {
  const [title, setTitle] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState("");

  const ideas = useMindStore((s) => s.ideas);
  const addIdea = useMindStore((s) => s.addIdea);
  const updateIdea = useMindStore((s) => s.updateIdea);
  const deleteIdea = useMindStore((s) => s.deleteIdea);

  const ordered = useMemo(
    () => Object.values(ideas).sort((a, b) => b.updatedAt - a.updatedAt),
    [ideas]
  );

  const saveNew = () => {
    const t = title.trim();
    if (!t) return;
    addIdea(t, expanded ? details : undefined);
    setTitle("");
    setDetails("");
    setExpanded(false);
  };

  return (
    <div className="space-y-5">
      {/* Composer */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6">
        <label className="mb-2 block text-sm text-neutral-300">
          Quick idea (one line)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g., "a hat for cats"`}
          className="mb-3 w-full rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 outline-none focus:border-neutral-600"
        />

        {expanded ? (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Expand on the idea…"
            rows={6}
            className="mb-3 w-full rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none focus:border-neutral-600"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            {expanded ? "Hide details" : "Expand on this"}
          </button>
          <button
            type="button"
            onClick={saveNew}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Save
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60">
        <div className="border-b border-neutral-800 px-4 py-3 text-sm text-neutral-400">
          Ideas ({ordered.length})
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {ordered.length === 0 ? (
            <div className="p-6 text-sm text-neutral-400">
              No ideas yet. Jot one above.
            </div>
          ) : (
            <ul className="space-y-2">
              {ordered.map((idea) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  onUpdate={(patch) => updateIdea(idea.id, patch)}
                  onDelete={() => deleteIdea(idea.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function IdeaRow({
  idea,
  onUpdate,
  onDelete,
}: {
  idea: {
    id: string;
    title: string;
    details?: string;
    createdAt: number;
    updatedAt: number;
  };
  onUpdate: (patch: Partial<{ title: string; details?: string }>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [details, setDetails] = useState(idea.details ?? "");

  const save = () => {
    const patch: Partial<{ title: string; details?: string }> = {};
    if (title.trim() !== idea.title) patch.title = title.trim();
    if ((details.trim() || undefined) !== (idea.details ?? undefined)) {
      patch.details = details.trim() || undefined;
    }
    if (Object.keys(patch).length > 0) onUpdate(patch);
    setEditing(false);
  };

  return (
    <li className="rounded-md border border-neutral-800 bg-neutral-900/50 p-3">
      {editing ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
          />
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add more color…"
            rows={4}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-sm text-neutral-200 outline-none focus:border-neutral-600"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-neutral-200">
              {idea.title}
            </div>
            {idea.details ? (
              <div className="mt-1 whitespace-pre-wrap text-sm text-neutral-400">
                {idea.details}
              </div>
            ) : null}
            <div className="mt-2 text-xs text-neutral-500">
              Updated {new Date(idea.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
            >
              Expand
            </button>
            <button
              onClick={onDelete}
              className="rounded-md border border-red-700/50 px-2 py-1 text-xs text-red-300 hover:bg-red-900/20"
              title="Delete idea"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
