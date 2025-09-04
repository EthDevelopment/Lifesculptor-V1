import { useEffect, useMemo, useRef, useState } from "react";
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

  const detailsRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!detailsRef.current) return;
    detailsRef.current.style.height = "0px";
    detailsRef.current.style.height = detailsRef.current.scrollHeight + "px";
  }, [details]);

  const saveNew = () => {
    const t = title.trim();
    if (!t && !details.trim()) return;
    addIdea(t || "Untitled idea", expanded ? details : undefined);
    setTitle("");
    setDetails("");
    setExpanded(false);
  };

  const onComposerKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
      e.preventDefault();
      saveNew();
    }
  };

  return (
    <div className="space-y-5">
      {/* Composer */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
        <label className="mb-2 block text-xs uppercase tracking-wide text-neutral-500">
          Quick idea
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onComposerKey}
          placeholder="Any ideas...? (⌘/Ctrl + Enter to save)"
          className="mb-3 w-full rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-600"
        />

        {expanded ? (
          <textarea
            ref={detailsRef}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyDown={onComposerKey}
            placeholder="Expand on the idea… (⌘/Ctrl + Enter to save)"
            rows={4}
            className="mb-3 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-600"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            {expanded ? "Hide details" : "Add details"}
          </button>
          <button
            type="button"
            onClick={saveNew}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Save idea
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 text-sm text-neutral-400">
          <span>Ideas ({ordered.length})</span>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
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

  const detailsRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!detailsRef.current) return;
    detailsRef.current.style.height = "0px";
    detailsRef.current.style.height = detailsRef.current.scrollHeight + "px";
  }, [details]);

  const save = () => {
    const patch: Partial<{ title: string; details?: string }> = {};
    if (title.trim() !== idea.title) patch.title = title.trim();
    if ((details.trim() || undefined) !== (idea.details ?? undefined)) {
      patch.details = details.trim() || undefined;
    }
    if (Object.keys(patch).length > 0) onUpdate(patch);
    setEditing(false);
  };

  const onRowKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
      e.preventDefault();
      save();
    }
  };

  return (
    <li className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
      {editing ? (
        <div className="space-y-2" onKeyDown={onRowKey}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
          <textarea
            ref={detailsRef}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add more color… (⌘/Ctrl + Enter to save)"
            rows={3}
            className="w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 p-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
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
            <div className="text-sm font-medium text-neutral-100">
              {idea.title}
            </div>
            {idea.details ? (
              <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-300">
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
