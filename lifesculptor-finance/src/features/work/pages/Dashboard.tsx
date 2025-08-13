import { useMemo, useState } from "react";
import Dashboard, {
  type Metric,
  type ChartBlock,
} from "@/components/dashboard/Dashboard";
import PageTabs from "@/components/nav/PageTabs";
import { Briefcase, Target, BarChart2, Settings as Cog } from "lucide-react";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { COLORS } from "@/constants/colors";

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const output = weeks.map((w, i) => ({ w, tasks: 22 + (i % 5) * 3 }));
const deep = weeks.map((w, i) => ({
  w,
  hours: 12 + Math.round(4 * Math.cos(i / 1.7)),
}));

export default function WorkDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [tab, setTab] = useState<
    "overview" | "projects" | "trends" | "settings"
  >("overview");

  const metrics: Metric[] = useMemo(
    () => [
      {
        id: "we",
        label: "Work ethic index",
        value: "82 / 100",
        deltaPct: 1.1,
        intent: "success",
      },
      { id: "pr", label: "Active projects", value: 4 },
      { id: "dt", label: "Deep work (h/w)", value: "14.5h", intent: "success" },
      { id: "bu", label: "Burnout risk", value: "Low", intent: "success" },
    ],
    []
  );

  const chartsTop: ChartBlock[] = [
    {
      id: "tasks-line",
      title: "Tasks completed / week",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={output}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="w" tick={{ fill: "#9ca3af", fontSize: 12 }} />
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
              dataKey="tasks"
              stroke={COLORS.netWorthBlue}
              strokeWidth={2.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "deep-line",
      title: "Deep work hours / week",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={deep}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="w" tick={{ fill: "#9ca3af", fontSize: 12 }} />
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
              dataKey="hours"
              stroke={COLORS.incomeGreen}
              strokeWidth={2.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const tabs = (
    <PageTabs
      activeKey={tab}
      onChange={(k) => setTab(k as typeof tab)}
      items={[
        { key: "overview", label: "Overview", icon: <Briefcase size={14} /> },
        { key: "projects", label: "Projects", icon: <Target size={14} /> },
        { key: "trends", label: "Trends", icon: <BarChart2 size={14} /> },
        { key: "settings", label: "Settings", icon: <Cog size={14} /> },
      ]}
    />
  );

  const panel =
    tab === "overview" ? null : (
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
        {tab === "projects" && "Projects list / board placeholder…"}
        {tab === "trends" && "Work trends coming soon…"}
        {tab === "settings" && "Work settings coming soon…"}
      </div>
    );

  return (
    <Dashboard
      title="Work"
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
