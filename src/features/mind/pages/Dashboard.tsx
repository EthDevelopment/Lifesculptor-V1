// src/features/mind/pages/Dashboard.tsx
import { useMemo, useState } from "react";
import Dashboard, {
  type Metric,
  type ChartBlock,
} from "@/components/dashboard/Dashboard";
import PageTabs from "@/components/nav/PageTabs";
import { Brain, Heart, BarChart2, Focus, Settings as Cog } from "lucide-react";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import { useMindStore } from "@/domains/mind/store";

// Panels
import FocusPanel from "@/features/mind/components/FocusPanel";
import IdeasPanel from "@/features/mind/components/IdeasPanel";
import JournalPanel from "@/features/mind/components/JournalPanel";
import MindSettingsPanel from "@/features/mind/components/MindSettingsPanel";
import MoodChart from "@/features/mind/components/charts/MoodChart";
import FocusChart from "@/features/mind/components/charts/FocusChart";

// Sleek tooltip
export function MindTooltip({ label, payload }: any) {
  const items = Array.isArray(payload)
    ? payload.filter((p) => p && p.value != null)
    : [];
  if (!items.length) return null;
  return (
    <div
      style={{
        background: "#0b0b0bcc",
        border: "1px solid #1f1f1f",
        borderRadius: 12,
        padding: "10px 12px",
        backdropFilter: "blur(6px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {items.map((it: any, i: number) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: it.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "#e5e7eb" }}>{it.name}</span>
            <span
              style={{ marginLeft: "auto", fontWeight: 600, color: "#fff" }}
            >
              {typeof it.value === "number"
                ? it.value.toLocaleString()
                : it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const axisStyle = {
  tick: { fill: "#9ca3af", fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

const RANGE_LABEL: Record<RangeKey, string> = {
  "1M": "1 month",
  "6M": "6 months",
  "12M": "12 months",
  "24M": "24 months",
  ALL: "All time",
};

function getRangeWindow(
  range: RangeKey,
  journal: Record<string, any>,
  focus: Record<string, any>
) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (range === "ALL") {
    let minTs: number | undefined;
    for (const e of Object.values(journal)) {
      const ts = new Date((e as any).date + "T00:00:00").getTime();
      minTs = minTs === undefined ? ts : Math.min(minTs, ts);
    }
    for (const s of Object.values(focus)) {
      const ts = new Date(
        new Date((s as any).startedAt).toISOString().slice(0, 10) + "T00:00:00"
      ).getTime();
      minTs = minTs === undefined ? ts : Math.min(minTs, ts);
    }
    const start = minTs ? new Date(minTs) : new Date(end);
    return { start, end };
  }

  const monthsMap = { "1M": 1, "6M": 6, "12M": 12, "24M": 24 } as const;
  const months = (monthsMap as any)[range] ?? 1;
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  return { start, end };
}

function daysBetween(start: Date, end: Date) {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  const b = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();
  return Math.max(1, Math.round((b - a) / MS) + 1); // inclusive days
}

export default function MindDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [tab, setTab] = useState<
    "overview" | "journaling" | "ideas" | "focus" | "settings"
  >("overview");

  const journal = useMindStore((s) => s.journal);
  const focusSessions = useMindStore((s) => s.focusSessions);

  const { focusSeries, moodLineSeries, moodAvg, focusTotalMin } =
    useMemo(() => {
      const { start, end } = getRangeWindow(range, journal, focusSessions);

      const jByDay = new Map<
        string,
        { count: number; moodSum: number; moodCount: number }
      >();
      for (const e of Object.values(journal)) {
        const d = e.date;
        const ts = new Date(d + "T00:00:00").getTime();
        if (ts < start.getTime() || ts > end.getTime()) continue;
        const cell = jByDay.get(d) ?? { count: 0, moodSum: 0, moodCount: 0 };
        cell.count += 1;
        if (typeof e.mood === "number") {
          cell.moodSum += e.mood;
          cell.moodCount += 1;
        }
        jByDay.set(d, cell);
      }

      const fByDay = new Map<string, number>();
      for (const s of Object.values(focusSessions)) {
        const day = new Date(s.startedAt);
        const dayKey = day.toISOString().slice(0, 10);
        const ts = new Date(dayKey + "T00:00:00").getTime();
        if (ts < start.getTime() || ts > end.getTime()) continue;
        const prev = fByDay.get(dayKey) ?? 0;
        fByDay.set(dayKey, prev + Math.round(s.secondsWorked / 60));
      }

      const nDays = daysBetween(start, end);
      const seriesJ: {
        key: string;
        label: string;
        entries: number;
        mood: number | null;
      }[] = [];
      const seriesF: { key: string; label: string; minutes: number }[] = [];

      let moodSum = 0,
        moodDays = 0,
        focusMin = 0;

      for (let i = 0; i < nDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

        const j = jByDay.get(key);
        const entries = j?.count ?? 0;
        const mood =
          j && j.moodCount > 0
            ? Number((j.moodSum / j.moodCount).toFixed(1))
            : null;
        if (mood != null) {
          moodSum += mood;
          moodDays += 1;
        }
        seriesJ.push({ key, label, entries, mood });

        const minutes = fByDay.get(key) ?? 0;
        focusMin += minutes;
        seriesF.push({ key, label, minutes });
      }

      const moodLineSeries = seriesJ.map((pt) => ({
        key: pt.key,
        label: pt.label,
        mood: pt.mood,
      }));
      const idx: number[] = [];
      for (let i = 0; i < moodLineSeries.length; i++) {
        if (typeof moodLineSeries[i].mood === "number") idx.push(i);
      }

      if (idx.length === 0) {
        for (let i = 0; i < moodLineSeries.length; i++)
          moodLineSeries[i].mood = 5;
      } else {
        for (let i = 0; i < idx[0]; i++)
          moodLineSeries[i].mood = moodLineSeries[idx[0]].mood!;
        for (let i = idx[idx.length - 1] + 1; i < moodLineSeries.length; i++)
          moodLineSeries[i].mood = moodLineSeries[idx[idx.length - 1]].mood!;
        for (let k = 0; k < idx.length - 1; k++) {
          const a = idx[k];
          const b = idx[k + 1];
          const mA = moodLineSeries[a].mood!;
          const mB = moodLineSeries[b].mood!;
          const span = b - a;
          for (let i = a + 1; i < b; i++) {
            const t = (i - a) / span;
            moodLineSeries[i].mood = mA + (mB - mA) * t;
          }
        }
      }

      return {
        journalSeries: seriesJ,
        focusSeries: seriesF,
        moodLineSeries,
        moodAvg: moodDays ? moodSum / moodDays : null,
        focusTotalMin: focusMin,
      };
    }, [journal, focusSessions, range]);

  const metrics: Metric[] = useMemo(() => {
    const label = RANGE_LABEL[range] ?? "selected range";
    const moodText = moodAvg != null ? `${moodAvg.toFixed(1)} / 10` : "–";
    const focusHrs = focusTotalMin / 60 || 0;
    return [
      { id: "mood", label: `Mood (${label} avg)`, value: moodText },
      {
        id: "focus",
        label: `Focus time (${label})`,
        value: `${focusHrs.toFixed(1)}h`,
      },
      { id: "stress", label: "Stress", value: "—" },
      { id: "sleep", label: "Mindful mins", value: "—" },
    ];
  }, [moodAvg, focusTotalMin, range]);

  const chartsTop: ChartBlock[] = [
    {
      id: "journal-mood",
      title: "Mood by day",
      render: () => <MoodChart moodLineSeries={moodLineSeries} />,
    },
    {
      id: "focus-minutes",
      title: `Focus time (minutes/day, ${RANGE_LABEL[range] || "range"})`,
      render: () => <FocusChart focusSeries={focusSeries} />,
    },
  ];

  const tabs = (
    <PageTabs
      activeKey={tab}
      onChange={(k) => setTab(k as typeof tab)}
      items={[
        { key: "overview", label: "Overview", icon: <Brain size={14} /> },
        { key: "journaling", label: "Journaling", icon: <Heart size={14} /> },
        { key: "ideas", label: "Ideas", icon: <BarChart2 size={14} /> },
        { key: "focus", label: "Focus", icon: <Focus size={14} /> },
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
        ) : tab === "focus" ? (
          <FocusPanel />
        ) : tab === "settings" ? (
          <MindSettingsPanel />
        ) : null}
      </>
    );

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
