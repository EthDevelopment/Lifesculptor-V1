import { useMemo, useState } from "react";
import Dashboard, {
  type Metric,
  type ChartBlock,
} from "@/components/dashboard/Dashboard";
import PageTabs from "@/components/nav/PageTabs";
import {
  BarChart2,
  CreditCard,
  PiggyBank,
  Settings as Cog,
} from "lucide-react";

import { useFinanceStore } from "@/features/finance/stores/useFinanceStore";
import { gbp } from "@/lib/format";
import { COLORS } from "@/constants/colors";
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
import type { RangeKey } from "@/components/dashboard/RangeTabs";
import {
  startOfMonth,
  subMonths,
  isSameMonth,
  parseISO,
  format,
} from "date-fns";

export default function FinanceDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const tabs = (
    <PageTabs
      items={[
        { to: "/finance", label: "Overview", icon: <PiggyBank size={14} /> },
        {
          to: "/finance/accounts",
          label: "Accounts",
          icon: <CreditCard size={14} />,
        },
        {
          to: "/finance/transactions",
          label: "Transactions",
          icon: <BarChart2 size={14} />,
        },
        {
          to: "/finance/forecast",
          label: "Forecast",
          icon: <BarChart2 size={14} />,
        },
        { to: "/finance/settings", label: "Settings", icon: <Cog size={14} /> },
      ]}
    />
  );
  // store selectors
  const netWorthAt = useFinanceStore((s) => s.netWorthAt);
  const monthIncome = useFinanceStore((s) => s.monthIncome());
  const monthExpenses = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());
  const txns = useFinanceStore((s) => s.transactions);
  const netWorthSeriesFn = useFinanceStore((s) => s.netWorthSeries);

  // metrics
  const metrics: Metric[] = useMemo(() => {
    const nw = netWorthAt(new Date());
    return [
      { id: "nw", label: "Net worth", value: gbp(nw) },
      {
        id: "inc",
        label: "Monthly income",
        value: gbp(monthIncome),
        intent: "success",
      },
      {
        id: "exp",
        label: "Monthly expenses",
        value: gbp(monthExpenses),
        intent: "warning",
      },
      {
        id: "sr",
        label: "Savings rate",
        value: `${(savingsRate * 100).toFixed(1)}%`,
      },
    ];
  }, [monthIncome, monthExpenses, savingsRate, netWorthAt]);

  // derive range months
  const monthsBack =
    range === "1M"
      ? 1
      : range === "6M"
      ? 6
      : range === "12M"
      ? 12
      : range === "24M"
      ? 24
      : 36;
  const months: { date: Date; label: string }[] = useMemo(() => {
    const now = new Date();
    const arr: { date: Date; label: string }[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      arr.push({ date: d, label: format(d, "MMM yy") });
    }
    return arr;
  }, [monthsBack]);

  // finance net worth series
  const nwSeries = useMemo(() => {
    if (!months.length) return [];
    const from = months[0].date;
    const to = new Date();
    return netWorthSeriesFn(from, to).map((p) => ({
      month: format(p.date, "MMM yy"),
      value: p.value,
    }));
  }, [months, netWorthSeriesFn]);

  // cashflow bars
  const cashflow = useMemo(() => {
    return months.map(({ date, label }) => {
      let income = 0;
      let expense = 0;
      for (const t of txns) {
        const d = parseISO(t.date);
        if (isSameMonth(d, date)) {
          if (t.type === "income") income += t.amount;
          if (t.type === "expense") expense += t.amount;
        }
      }
      return { month: label, income, expense, net: income - expense };
    });
  }, [months, txns]);

  // charts config
  const chartsTop: ChartBlock[] = [
    {
      id: "nw-line",
      title: "Net worth",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={nwSeries}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => gbp(v)}
              width={60}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              formatter={(v: any) => gbp(v)}
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.netWorthBlue}
              strokeWidth={2.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "cash-bars",
      title: "Monthly cashflow",
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={cashflow}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => gbp(v)}
              width={60}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              formatter={(v: any, name: any) => [gbp(v), name]}
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Bar dataKey="income" fill={COLORS.incomeGreen} />
            <Bar dataKey="expense" fill={COLORS.expenseRed} />
            <Bar dataKey="net" fill={COLORS.netWorthBlue} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <Dashboard
      title="Dashboard"
      metrics={metrics}
      chartsTop={chartsTop}
      range={range}
      onRangeChange={setRange}
      tabs={tabs}
    />
  );
}
