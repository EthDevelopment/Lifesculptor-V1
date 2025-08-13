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

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mood = days.map((d, i) => ({
  d,
  score: 5 + Math.round(2 * Math.sin(i / 1.5)),
}));
const focus = days.map((d, i) => ({ d, pct: 55 + (i % 4) * 6 }));

export default function SettingsDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [tab, setTab] = useState<"Finance" | "Health" | "Work" | "Mind">(
    "Finance"
  );

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
      { id: "sleep", label: "Settingsful mins", value: "52m" },
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
        { key: "Finance", label: "Finance", icon: <Brain size={14} /> },
        { key: "Health", label: "Health", icon: <Heart size={14} /> },
        { key: "Work", label: "Work", icon: <BarChart2 size={14} /> },
        { key: "Mind", label: "Mind", icon: <Cog size={14} /> },
      ]}
    />
  );

  const panel =
    tab === "Finance" ? null : (
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
        {tab === "Finance" && "Finance settings placeholder…"}
        {tab === "Health" && "Health settings placeholder…"}
        {tab === "Work" && "Work settings coming soon…"}
        {tab === "Mind" && "Mind settings coming soon…"}
      </div>
    );

  return (
    <Dashboard
      title="Settings"
      metrics={metrics}
      chartsTop={tab === "finance" ? chartsTop : undefined}
      tabs={tabs}
      range={range}
      onRangeChange={setRange}
    >
      {panel}
    </Dashboard>
  );
}
