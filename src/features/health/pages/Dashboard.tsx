import { useMemo, useState } from "react";
import Dashboard, {
  type Metric,
  type ChartBlock,
} from "@/components/dashboard/Dashboard";
import PageTabs from "@/components/nav/PageTabs";
import { Dumbbell, Apple, ScanEye, HeartPulse } from "lucide-react";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { COLORS } from "@/constants/colors";

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const healthLine = WEEKS.map((w, i) => ({
  label: w,
  score: 60 + Math.round(8 * Math.sin(i / 2)),
}));
const workoutBars = WEEKS.map((w, i) => ({
  label: w,
  mins: 90 + (i % 3) * 15,
}));

export default function HealthDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [tab, setTab] = useState<
    "overview" | "workouts" | "nutrition" | "insights"
  >("overview");

  const metrics: Metric[] = useMemo(
    () => [
      {
        id: "hs",
        label: "Health score",
        value: "74 / 100",
        intent: "success",
        deltaPct: 2.1,
      },
      { id: "hr", label: "Resting HR", value: "58 bpm" },
      { id: "sl", label: "Sleep (avg)", value: "7h 18m", intent: "success" },
      {
        id: "st",
        label: "Stress (self‑rated)",
        value: "3 / 10",
        intent: "success",
      },
    ],
    []
  );

  const chartsTop: ChartBlock[] = [
    {
      id: "hs-line",
      title: "Health score (weekly)",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={healthLine}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
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
      id: "workout-bars",
      title: "Exercise minutes per week",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={workoutBars}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="mins" fill={COLORS.incomeGreen} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const tabs = (
    <PageTabs
      activeKey={tab}
      onChange={(k) => setTab(k as typeof tab)}
      items={[
        { key: "overview", label: "Overview", icon: <HeartPulse size={14} /> },
        { key: "workouts", label: "workouts", icon: <Dumbbell size={14} /> },
        { key: "nutrition", label: "nutrition", icon: <Apple size={14} /> },
        { key: "insights", label: "insights", icon: <ScanEye size={14} /> },
      ]}
    />
  );

  const tabContent =
    tab === "overview" ? null : (
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
        {tab === "workouts" && "Health insights coming soon…"}
        {tab === "nutrition" && "Trend analysis coming soon…"}
        {tab === "insights" && "Health settings coming soon…"}
      </div>
    );

  return (
    <Dashboard
      title="Health"
      metrics={metrics}
      chartsTop={tab === "overview" ? chartsTop : undefined}
      tabs={tabs}
      range={range}
      onRangeChange={setRange}
    >
      {tab === "overview" ? null : tabContent}
    </Dashboard>
  );
}
