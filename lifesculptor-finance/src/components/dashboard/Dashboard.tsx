import type { ReactNode } from "react";
import DashboardShell from "./DashboardShell";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import RangeTabs, { type RangeKey } from "./RangeTabs";

export type Metric = {
  id: string;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  intent?: "default" | "success" | "warning" | "danger";
};

export type ChartBlock = {
  id: string;
  title: string;
  // You render the actual chart. We pass height + width constraints via parent.
  render: () => ReactNode;
};

export default function Dashboard({
  title,
  subtitle,
  metrics,
  chartsTop, // usually 2-up (e.g., history + projection)
  chartsBottom, // optional, 3–4 small cards or bars
  range,
  onRangeChange,
  actionsRight,
  tabs, // <- NEW
}: {
  title: string;
  subtitle?: ReactNode;
  metrics: Metric[];
  chartsTop: ChartBlock[];
  chartsBottom?: ChartBlock[];
  range?: RangeKey;
  onRangeChange?: (v: RangeKey) => void;
  actionsRight?: ReactNode;
  tabs?: ReactNode; // <- NEW
}) {
  return (
    <DashboardShell
      title={title}
      subtitle={subtitle}
      actions={
        range && onRangeChange ? (
          <RangeTabs value={range} onChange={onRangeChange} />
        ) : (
          actionsRight ?? null
        )
      }
    >
      {/* Metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            hint={m.hint}
            intent={m.intent}
          />
        ))}
      </div>

      {/* Page Tabs (below metrics, above charts) */}
      {tabs ? <div className="mt-4">{tabs}</div> : null}

      {/* Top charts */}
      {chartsTop.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartsTop.map((c) => (
            <ChartCard key={c.id} title={c.title}>
              <div className="h-72">{c.render()}</div>
            </ChartCard>
          ))}
        </div>
      ) : null}

      {/* Bottom charts */}
      {chartsBottom && chartsBottom.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chartsBottom.map((c) => (
            <ChartCard key={c.id} title={c.title}>
              <div className="h-48">{c.render()}</div>
            </ChartCard>
          ))}
        </div>
      ) : null}
    </DashboardShell>
  );
}
