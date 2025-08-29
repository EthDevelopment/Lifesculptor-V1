import { useMemo, useState } from "react";
import Dashboard, {
  type Metric,
  type ChartBlock,
} from "@/components/dashboard/Dashboard";
import PageTabs from "@/components/nav/PageTabs";
import { Brain, Heart, BarChart2, Settings as Cog } from "lucide-react";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { COLORS } from "@/constants/colors";
import { useMindStore } from "@/domains/mind/store";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mood = days.map((d, i) => ({
  d,
  score: 5 + Math.round(2 * Math.sin(i / 1.5)),
}));
const focus = days.map((d, i) => ({ d, pct: 55 + (i % 4) * 6 }));

export default function MindDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [tab, setTab] = useState<
    "overview" | "journaling" | "trends" | "ideas" | "settings"
  >("overview");

  const metrics: Metric[] = useMemo(
    () => [
      {
        id: "mood",
        label: "Mood (avg)",
        value: "7.2 / 10",
        intent: "success",
        deltaPct: 1.4,
      },
      { id: "focus", label: "Focus (avg)", value: "63%", intent: "success" },
      { id: "stress", label: "Stress", value: "3 / 10", intent: "success" },
      { id: "sleep", label: "Mindful mins", value: "52m" },
    ],
    []
  );

  const chartsTop: ChartBlock[] = [
    {
      id: "mood-line",
      title: "Mood by day",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mood}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={COLORS.netWorthBlue}
              strokeWidth={2.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "focus-area",
      title: "Focused time (%)",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={focus}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
              }}
            />
            <Area
              dataKey="pct"
              stroke={COLORS.incomeGreen}
              fill={COLORS.incomeGreen}
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const tabs = (
    <PageTabs
      activeKey={tab}
      onChange={(k) => setTab(k as typeof tab)}
      items={[
        { key: "overview", label: "Overview", icon: <Brain size={14} /> },
        { key: "journaling", label: "Journaling", icon: <Heart size={14} /> },
        { key: "trends", label: "Trends", icon: <BarChart2 size={14} /> },
        { key: "ideas", label: "ideas", icon: <BarChart2 size={14} /> },
        { key: "settings", label: "Settings", icon: <Cog size={14} /> },
      ]}
    />
  );

  const panel =
    tab === "overview" ? null : (
      <>
        {tab === "journaling" ? (
          <JournalPanel />
        ) : tab === "ideas" ? (
          <IdeasPanel />
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
            {tab === "trends" && "Mind trends coming soon…"}
            {tab === "settings" && "Mind settings coming soon…"}
          </div>
        )}
      </>
    );

  function IdeasPanel() {
    const [title, setTitle] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState("");

    const ideas = useMindStore((s) => s.ideas);
    const addIdea = useMindStore((s) => s.addIdea);
    const updateIdea = useMindStore((s) => s.updateIdea);
    const deleteIdea = useMindStore((s) => s.deleteIdea);

    const ordered = useMemo(() => {
      return Object.values(ideas).sort((a, b) => b.updatedAt - a.updatedAt);
    }, [ideas]);

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
                <div className="mt-1 text-sm text-neutral-400 whitespace-pre-wrap">
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

  function JournalPanel() {
    // today's ISO date
    const today = new Date().toISOString().slice(0, 10);

    const [date, setDate] = useState<string>(today);
    const [body, setBody] = useState<string>("");

    const journal = useMindStore((s) => s.journal);
    const upsertJournal = useMindStore((s) => s.upsertJournal);
    const removeJournal = useMindStore((s) => s.removeJournal);

    // Load entry when date changes or store changes
    // (so switching dates or saving elsewhere updates the editor)
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

  return (
    <Dashboard
      title="Mind"
      metrics={metrics}
      chartsTop={tab === "overview" ? chartsTop : undefined}
      tabs={tabs}
      range={range}
      onRangeChange={setRange}
    >
      {panel}
    </Dashboard>
  );
}
