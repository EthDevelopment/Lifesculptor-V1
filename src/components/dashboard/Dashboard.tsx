import type { ReactNode } from "react";
import RangeTabs, { type RangeKey } from "./RangeTabs";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export type Metric = {
  id: string;
  label: string;
  value: string | number;
  intent?: "success" | "warning" | "danger";
  /** Optional percent change to display as a small badge, e.g. +5.6 */
  deltaPct?: number;
};

export type ChartBlock = {
  id: string;
  title: string;
  render: () => ReactNode;
};

export default function Dashboard({
  title,
  subtitle,
  metrics,
  chartsTop,
  tabs, // the rendered PageTabs
  range,
  onRangeChange,
  children, // <-- NEW: content slot that replaces the charts area when you want
  className,
}: {
  title: string;
  subtitle?: string;
  metrics: Metric[];
  chartsTop?: ChartBlock[];
  tabs?: ReactNode;
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          ) : null}
        </div>
        <RangeTabs value={range} onChange={onRangeChange} />
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4"
          >
            <div className="text-neutral-400 text-xs">{m.label}</div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={cn("text-xl font-medium", {
                  "text-emerald-400": m.intent === "success",
                  "text-amber-400": m.intent === "warning",
                  "text-red-400": m.intent === "danger",
                })}
              >
                {m.value}
              </div>
              {typeof m.deltaPct === "number" ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                    m.deltaPct > 0
                      ? "bg-emerald-600/20 text-emerald-300"
                      : m.deltaPct < 0
                      ? "bg-red-600/20 text-red-300"
                      : "bg-neutral-800 text-neutral-300"
                  )}
                  title="Change over selected range"
                >
                  {m.deltaPct > 0 ? (
                    <ArrowUpRight size={14} />
                  ) : m.deltaPct < 0 ? (
                    <ArrowDownRight size={14} />
                  ) : (
                    <Minus size={14} />
                  )}
                  {`${Math.abs(m.deltaPct).toFixed(1)}%`}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Page tabs */}
      {tabs ? <div className="pt-2">{tabs}</div> : null}

      {/* Main content area under tabs */}
      <div className="grid gap-4 pt-2">
        {/*
          If children are provided, render those (e.g., Accounts / Transactions panels).
          Otherwise fall back to the default charts top grid.
        */}
        {children ? (
          children
        ) : chartsTop && chartsTop.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {chartsTop.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3"
              >
                <div className="mb-2 text-sm text-neutral-300">{b.title}</div>
                <div className="h-[280px]">{b.render()}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
