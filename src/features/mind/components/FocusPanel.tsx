import { useEffect, useMemo, useRef, useState } from "react";
import { useMindStore } from "@/domains/mind/store";

export default function FocusPanel() {
  const {
    activeFocus,
    startFocus,
    pauseFocus,
    resumeFocus,
    tickFocus,
    endFocus,
    cancelFocus,
  } = useMindStore();

  // Persist last-used custom config
  const CFG_LS_KEY = "ls_focus_custom_cfg_v1";
  const loadCfg = (): {
    label: string;
    total: number;
    breakEvery: number;
    breakMinutes: number;
  } => {
    try {
      const raw = localStorage.getItem(CFG_LS_KEY);
      if (!raw)
        return { label: "", total: 75, breakEvery: 25, breakMinutes: 5 };
      const p = JSON.parse(raw);
      return {
        label: typeof p.label === "string" ? p.label : "",
        total: Math.max(1, Math.min(600, Number(p.total) || 25)),
        breakEvery: Math.max(1, Math.min(180, Number(p.breakEvery) || 25)),
        breakMinutes: Math.max(1, Math.min(60, Number(p.breakMinutes) || 5)),
      };
    } catch {
      return { label: "", total: 75, breakEvery: 25, breakMinutes: 5 };
    }
  };
  const saveCfg = (cfg: {
    label: string;
    total: number;
    breakEvery: number;
    breakMinutes: number;
  }) => {
    try {
      localStorage.setItem(CFG_LS_KEY, JSON.stringify(cfg));
    } catch {}
  };

  // Custom config state (shown when no active session)
  const [customOpen, setCustomOpen] = useState(false);
  const initial = loadCfg();
  const [label, setLabel] = useState(initial.label);
  const [total, setTotal] = useState(initial.total);
  const [breakEvery, setBreakEvery] = useState(initial.breakEvery);
  const [breakMinutes, setBreakMinutes] = useState(initial.breakMinutes);
  const [notes, setNotes] = useState("");

  // 1 Hz ticker while active & not paused
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (activeFocus && !activeFocus.isPaused) {
      intervalRef.current = window.setInterval(() => tickFocus(1), 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [activeFocus?.id, activeFocus?.isPaused]);

  const totalSecs = activeFocus ? activeFocus.config.totalMinutes * 60 : 0;
  const progress = useMemo(() => {
    if (!activeFocus || totalSecs === 0) return 0;
    return Math.min(100, (activeFocus.secondsElapsed / totalSecs) * 100);
  }, [activeFocus, totalSecs]);

  const remaining = Math.max(0, totalSecs - (activeFocus?.secondsElapsed ?? 0));
  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${ss}`;
  };

  const startQuick = () => startFocus(); // 25/5 default
  const startCustom = () => {
    const safe = (n: number, min: number, max: number) =>
      Math.max(min, Math.min(max, Math.round(n)));
    const cfgToSave = {
      label: label.trim() || "Focus",
      total: safe(total, 1, 600),
      breakEvery: safe(breakEvery, 1, 180),
      breakMinutes: safe(breakMinutes, 1, 60),
    };
    startFocus({
      label: cfgToSave.label,
      totalMinutes: cfgToSave.total,
      breakEvery: cfgToSave.breakEvery,
      breakMinutes: cfgToSave.breakMinutes,
    });
    saveCfg(cfgToSave);
    setCustomOpen(false);
    setNotes("");
  };

  // Keyboard handler for modal
  const onModalKey = (e: React.KeyboardEvent) => {
    if (!customOpen) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      startCustom();
    } else if (e.key === "Escape") {
      setCustomOpen(false);
    }
  };

  return (
    <div className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-200">Focus Work</h3>
        {!activeFocus && (
          <div className="flex gap-2">
            <button
              onClick={startQuick}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Start 25 / 5
            </button>
            <button
              onClick={() => {
                const i = loadCfg();
                setLabel(i.label);
                setTotal(i.total);
                setBreakEvery(i.breakEvery);
                setBreakMinutes(i.breakMinutes);
                setCustomOpen(true);
              }}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Custom
            </button>
          </div>
        )}
      </div>

      {/* Active Session */}
      {activeFocus ? (
        <div>
          <div className="mb-2 text-sm text-neutral-400">
            On:{" "}
            <span className="font-medium text-neutral-200">
              {activeFocus.config.label}
            </span>
          </div>

          <div className="mb-3 flex items-baseline gap-3">
            <div className="text-4xl font-semibold tabular-nums text-neutral-100">
              {fmt(remaining)}
            </div>
            <div className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
              <span
                className={
                  activeFocus.phase === "work"
                    ? "text-emerald-400"
                    : "text-sky-400"
                }
              >
                {activeFocus.phase === "work" ? "Work" : "Break"}
              </span>
            </div>
          </div>

          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-neutral-200 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            {!activeFocus.isPaused ? (
              <button
                onClick={pauseFocus}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={resumeFocus}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Resume
              </button>
            )}
            <button
              onClick={() => endFocus({ notes })}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              End & Log
            </button>
            <button
              onClick={cancelFocus}
              className="rounded-md border border-transparent px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500">What did you do?</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for the log"
              className="h-20 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 p-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-400">
          No active session. Start a quick 25/5 or configure a custom session.
        </p>
      )}

      {/* Recent Sessions */}
      <RecentFocusSessions />

      {/* Custom Config Modal */}
      {customOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-xl"
            onKeyDown={onModalKey}
            tabIndex={0}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold text-neutral-200">
                Custom Focus
              </h4>
              <button
                onClick={() => setCustomOpen(false)}
                className="text-sm text-neutral-400 hover:underline"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-xs text-neutral-400">
                  What are you working on?
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Deep work / Task"
                  className="rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StepperField
                  label="Total (min)"
                  value={total}
                  setValue={setTotal}
                  min={1}
                  max={600}
                  step={5}
                />
                <StepperField
                  label="Break every (min)"
                  value={breakEvery}
                  setValue={setBreakEvery}
                  min={1}
                  max={180}
                  step={5}
                />
                <StepperField
                  label="Break length (min)"
                  value={breakMinutes}
                  setValue={setBreakMinutes}
                  min={1}
                  max={60}
                  step={1}
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setCustomOpen(false)}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={startCustom}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Recent sessions (collapsible, searchable, paginated) ---------- */

function RecentFocusSessions() {
  const sessions = useMindStore((s) => s.focusSessions);
  const addFocusNote = useMindStore((s) => s.addFocusNote);

  // --- Controls / filters ---
  type RangeOpt = "7" | "30" | "90" | "365" | "all";
  const [range, setRange] = useState<RangeOpt>("30");
  const [query, setQuery] = useState("");

  // collapse state persisted per day-key
  const LS_KEY = "ls_focus_collapsed_v1";
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const saveCollapsed = (next: Record<string, boolean>) => {
    setCollapsed(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  };

  // Incremental day rendering to keep DOM light
  const [visibleDays, setVisibleDays] = useState(7);

  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  const rangeMs = useMemo(() => {
    switch (range) {
      case "7":
        return 7 * msInDay;
      case "30":
        return 30 * msInDay;
      case "90":
        return 90 * msInDay;
      case "365":
        return 365 * msInDay;
      case "all":
      default:
        return Number.POSITIVE_INFINITY;
    }
  }, [range]);

  const normalizedQuery = query.trim().toLowerCase();

  const ordered = useMemo(() => {
    return Object.values(sessions)
      .filter((s) => {
        const endTs = s.endedAt ?? s.startedAt;
        const within = now - endTs <= rangeMs;
        if (!within) return false;
        if (!normalizedQuery) return true;
        const hay = (s.label + " " + (s.notes ?? "")).toLowerCase();
        return hay.includes(normalizedQuery);
      })
      .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));
  }, [sessions, rangeMs, normalizedQuery]);

  // Group by date key (YYYY-MM-DD local)
  const dateKey = (ts: number) => {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const groups = useMemo(() => {
    const map = new Map<string, typeof ordered>();
    for (const s of ordered) {
      const key = dateKey(s.endedAt || s.startedAt);
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    const entries = Array.from(map.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    );
    return entries;
  }, [ordered]);

  // Only render up to N day-groups, load more on demand
  const visibleGroups = groups.slice(0, visibleDays);

  const toggle = (dayKey: string) => {
    const next = { ...collapsed, [dayKey]: !collapsed[dayKey] };
    saveCollapsed(next);
  };

  const setAll = (to: boolean) => {
    const next: Record<string, boolean> = {};
    for (const [key] of groups) next[key] = to;
    saveCollapsed(next);
  };

  // Human heading like "Today", "Yesterday", or date
  const prettyHeading = (dayKey: string) => {
    const [y, m, d] = dayKey.split("-").map((n) => parseInt(n, 10));
    const dayTs = new Date(y, m - 1, d).getTime();
    const diff = Math.floor((now - dayTs) / msInDay);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return new Date(dayTs).toLocaleDateString();
  };

  return (
    <div className="mt-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium text-neutral-200">
          Recent sessions
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value as RangeOpt);
              setVisibleDays(7); // reset pagination on range change
            }}
            className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-xs text-neutral-200 outline-none"
            title="Range"
          >
            <option value="7">7d</option>
            <option value="30">30d</option>
            <option value="90">90d</option>
            <option value="365">1y</option>
            <option value="all">All</option>
          </select>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleDays(7);
            }}
            placeholder="Search label/notes…"
            className="w-40 rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-xs text-neutral-200 outline-none"
          />
          <button
            onClick={() => setAll(false)}
            className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
            title="Collapse all"
          >
            Collapse all
          </button>
          <button
            onClick={() => setAll(true)}
            className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
            title="Expand all"
          >
            Expand all
          </button>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-md border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">
          No sessions match.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleGroups.map(([dayKey, list]) => {
            const open = collapsed[dayKey] ?? visibleGroups[0][0] === dayKey; // default: most recent open
            return (
              <div
                key={dayKey}
                className="rounded-lg border border-neutral-800 bg-neutral-950/60"
              >
                <button
                  onClick={() => toggle(dayKey)}
                  className="flex w-full items-center justify-between border-b border-neutral-800 px-4 py-2 text-left"
                >
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    {prettyHeading(dayKey)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {open ? "−" : "+"}
                  </div>
                </button>
                {open && (
                  <ul className="divide-y divide-neutral-800">
                    {list.map((s) => (
                      <SessionRow
                        key={s.id}
                        s={s}
                        onSaveNote={(t) => addFocusNote(s.id, t)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          {groups.length > visibleGroups.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleDays((n) => n + 7)}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Load 7 more days
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  s,
  onSaveNote,
}: {
  s: {
    id: string;
    label: string;
    startedAt: number;
    endedAt: number;
    secondsWorked: number;
    secondsOnBreak: number;
    notes?: string;
  };
  onSaveNote: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(s.notes ?? "");

  const dur = (sec: number) => {
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0) return `${h}h ${mm}m`;
    return `${mm}m`;
  };

  const start = new Date(s.startedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(s.endedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="grid gap-2 p-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">
            {s.label}
          </span>
          <span className="text-xs text-neutral-500">
            {start}–{end}
          </span>
        </div>
        <div className="mt-1 text-xs text-neutral-400">
          Worked {dur(s.secondsWorked)} • Breaks {dur(s.secondsOnBreak)}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 p-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
              placeholder="Notes…"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onSaveNote(text);
                  setEditing(false);
                }}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setText(s.notes ?? "");
                  setEditing(false);
                }}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : s.notes ? (
          <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">
            {s.notes}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            {s.notes ? "Edit note" : "Add note"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

/* ---------- Small UI helper ---------- */

function StepperField({
  label,
  value,
  setValue,
  min = 1,
  max = 999,
  step = 1,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));
  return (
    <div className="grid gap-1">
      <label className="text-xs text-neutral-400">{label}</label>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => setValue(clamp(value - step))}
          className="rounded-l-md border border-neutral-800 bg-neutral-900/70 px-2 text-neutral-300 hover:bg-neutral-800"
          aria-label="decrement"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={String(value)}
          onChange={(e) => {
            // digits only
            const raw = e.target.value.replace(/[^\d]/g, "");
            const num = raw === "" ? NaN : Number(raw);
            if (Number.isNaN(num)) {
              setValue(min);
            } else {
              setValue(clamp(num));
            }
          }}
          onBlur={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            const num = raw === "" ? min : Number(raw);
            setValue(clamp(num));
          }}
          className="w-full border-y border-neutral-800 bg-neutral-900/80 px-3 py-2 text-center text-sm text-neutral-100 outline-none focus:border-neutral-600"
        />
        <button
          type="button"
          onClick={() => setValue(clamp(value + step))}
          className="rounded-r-md border border-neutral-800 bg-neutral-900/70 px-2 text-neutral-300 hover:bg-neutral-800"
          aria-label="increment"
        >
          +
        </button>
      </div>
    </div>
  );
}
