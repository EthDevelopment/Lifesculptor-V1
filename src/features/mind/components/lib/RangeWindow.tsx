// src/features/mind/components/lib/RangeWindow.tsx
import type { RangeKey } from "@/components/dashboard/RangeTabs";

// Use a loose key type so extra labels (like 'ALL') don't break TS when RangeKey doesn't include them
export const RANGE_LABEL: Record<string, string> = {
  "1M": "1 month",
  "6M": "6 months",
  "12M": "12 months",
  "24M": "24 months",
  ALL: "All time",
};

export function getRangeWindow(
  range: RangeKey,
  journal: Record<string, any>,
  focus: Record<string, any>
) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if ((range as any) === "ALL") {
    let minTs: number | undefined;
    for (const e of Object.values(journal)) {
      const ts = new Date((e as any).date + "T00:00:00").getTime();
      minTs = minTs === undefined ? ts : Math.min(minTs, ts);
    }
    for (const s of Object.values(focus)) {
      const dayKey = new Date((s as any).startedAt).toISOString().slice(0, 10);
      const ts = new Date(dayKey + "T00:00:00").getTime();
      minTs = minTs === undefined ? ts : Math.min(minTs, ts);
    }
    const start = minTs ? new Date(minTs) : new Date(end);
    return { start, end };
  }

  const monthsMap: Record<string, number> = { "1M": 1, "6M": 6, "12M": 12, "24M": 24 };
  const months = monthsMap[range as any] ?? 1;
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  return { start, end };
}

export function daysBetween(start: Date, end: Date) {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.max(1, Math.round((b - a) / MS) + 1); // inclusive days
}
