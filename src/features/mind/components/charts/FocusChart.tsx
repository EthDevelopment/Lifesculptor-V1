// src/features/mind/components/charts/FocusChart.tsx
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import { COLORS } from "@/constants/colors";
import { MindTooltip, axisStyle } from "@/features/mind/pages/Dashboard";

export default function FocusChart({
  focusSeries,
}: {
  focusSeries: { key: string; label: string; minutes: number }[];
}) {
  const tickInterval = Math.max(1, Math.floor(focusSeries.length / 12));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={focusSeries}
        margin={{ left: 8, right: 8, top: 8, bottom: 4 }}
      >
        <defs>
          <linearGradient id="gradFocus" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={COLORS.incomeGreen}
              stopOpacity={0.9}
            />
            <stop
              offset="100%"
              stopColor={COLORS.incomeGreen}
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2a2a2a" strokeOpacity={0.12} vertical={false} />
        <XAxis dataKey="label" {...axisStyle} interval={tickInterval} />
        <YAxis {...axisStyle} width={34} />
        <Tooltip content={<MindTooltip />} />
        <Area
          dataKey="minutes"
          name="Minutes"
          type="monotone"
          stroke={COLORS.incomeGreen}
          fill="url(#gradFocus)"
          strokeWidth={2.2}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
