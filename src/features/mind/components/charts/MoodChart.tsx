// src/features/mind/components/charts/MoodChart.tsx
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
import { COLORS } from "@/constants/colors";
import { MindTooltip, axisStyle } from "@/features/mind/pages/Dashboard";

export default function MoodChart({
  moodLineSeries,
}: {
  moodLineSeries: { key: string; label: string; mood: number | null }[];
}) {
  const tickInterval = Math.max(1, Math.floor(moodLineSeries.length / 8));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={moodLineSeries}
        margin={{ left: 12, right: 12, top: 12, bottom: 8 }}
      >
        <CartesianGrid stroke="#2a2a2a" strokeOpacity={0.12} vertical={false} />
        <XAxis
          dataKey="label"
          {...axisStyle}
          interval={tickInterval}
          height={24}
        />
        <YAxis
          {...axisStyle}
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          width={32}
        />
        <Tooltip content={<MindTooltip />} />
        <Line
          type="monotone"
          dataKey="mood"
          name="Mood"
          stroke={COLORS.netWorthBlue}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
