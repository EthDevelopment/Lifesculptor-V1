// src/features/mind/components/lib/useMindOverviewData.ts
import { useMemo } from "react";
import { useMindStore } from "@/domains/mind/store";
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import {
  getRangeWindow,
  daysBetween,
} from "@/features/mind/components/lib/RangeWindow";

export function useMindOverviewData(range: RangeKey) {
  const journal = useMindStore((s) => s.journal);
  const focusSessions = useMindStore((s) => s.focusSessions);

  return useMemo(() => {
    const { start, end } = getRangeWindow(range, journal, focusSessions);

    // Journal aggregation (per day)
    const jByDay = new Map<
      string,
      { count: number; moodSum: number; moodCount: number }
    >();
    for (const e of Object.values(journal)) {
      const d = e.date; // YYYY-MM-DD
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

    // Focus aggregation (minutes per day)
    const fByDay = new Map<string, number>();
    for (const s of Object.values(focusSessions)) {
      const day = new Date(s.startedAt);
      const key = day.toISOString().slice(0, 10);
      const ts = new Date(key + "T00:00:00").getTime();
      if (ts < start.getTime() || ts > end.getTime()) continue;
      fByDay.set(
        key,
        (fByDay.get(key) ?? 0) + Math.round(s.secondsWorked / 60)
      );
    }

    // Build windowed daily series
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

    // Continuous mood line with linear interpolation
    const moodLineSeries = seriesJ.map((pt) => ({
      key: pt.key,
      label: pt.label,
      mood: pt.mood as number | null,
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
        const a = idx[k],
          b = idx[k + 1];
        const mA = moodLineSeries[a].mood!,
          mB = moodLineSeries[b].mood!;
        const span = b - a;
        for (let i = a + 1; i < b; i++) {
          const t = (i - a) / span;
          moodLineSeries[i].mood = mA + (mB - mA) * t;
        }
      }
    }

    return {
      focusSeries: seriesF,
      moodLineSeries,
      moodAvg: moodDays ? moodSum / moodDays : null,
      focusTotalMin: focusMin,
    };
  }, [journal, focusSessions, range]);
}
