// src/features/mind/components/lib/buildMetrics.ts
import type { Metric } from "@/components/dashboard/Dashboard";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import { RANGE_LABEL } from "@/features/mind/components/lib/RangeWindow";

export function buildMindMetrics({
  range,
  moodAvg,
  focusTotalMin,
}: {
  range: RangeKey;
  moodAvg: number | null;
  focusTotalMin: number;
}): Metric[] {
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
}
