import { useMemo } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import {
  format,
  subMonths,
  startOfMonth,
  isSameMonth,
  parseISO,
} from "date-fns";
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
  Legend,
} from "recharts";
import { gbp } from "@/lib/format";

export default function Dashboard() {
  const txns = useFinanceStore((s) => s.transactions);
  const netWorthNow = useFinanceStore((s) => s.netWorth());
  const monthInc = useFinanceStore((s) => s.monthIncome());
  const monthExp = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());

  // Build monthly buckets for the last 12 months (including current)
  const { cashflow, netWorthSeries } = useMemo(() => {
    const months: { key: string; date: Date }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      months.push({ key: format(d, "yyyy-MM"), date: d });
    }

    // Aggregate txns into months
    const cash = months.map((m) => {
      let income = 0;
      let expense = 0;
      for (const t of txns) {
        const td = parseISO(t.date);
        if (isSameMonth(td, m.date)) {
          if (t.type === "income") income += t.amount;
          if (t.type === "expense") expense += t.amount;
        }
      }
      return {
        month: format(m.date, "MMM yy"),
        income,
        expense,
        net: income - expense,
      };
    });

    // Net worth series as cumulative sum of monthly net deltas ending at current net worth
    // We backfill: compute cumulative delta over 12 months, then offset so last point equals netWorthNow
    const deltas = cash.map((c) => c.net);
    const cum = deltas.reduce<number[]>((arr, d, i) => {
      const prev = i === 0 ? 0 : arr[i - 1];
      arr.push(prev + d);
      return arr;
    }, []);

    // Offset so final cum matches current net worth
    const offset = netWorthNow - (cum[cum.length - 1] || 0);
    const netSeries = months.map((m, i) => ({
      month: format(m.date, "MMM yy"),
      netWorth: cum[i] + offset,
    }));

    return { cashflow: cash, netWorthSeries: netSeries };
  }, [txns, netWorthNow]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Net worth" value={gbp(netWorthNow)} />
        <KpiCard label="Monthly income" value={gbp(monthInc)} />
        <KpiCard label="Monthly expenses" value={gbp(monthExp)} />
        <KpiCard
          label="Savings rate"
          value={`${(savingsRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* Net worth history */}
      <section className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40">
        <div className="text-sm text-neutral-300 mb-2">
          Net worth (last 12 months)
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={netWorthSeries}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => gbp(v)} width={80} />
              <Tooltip
                formatter={(value) => [gbp(value as number), "Net worth"]}
                labelClassName="text-neutral-200"
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Cashflow bars */}
      <section className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40">
        <div className="text-sm text-neutral-300 mb-2">Monthly cashflow</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashflow}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => gbp(v)} width={80} />
              <Legend />
              <Tooltip
                formatter={(value, name) => [
                  gbp(value as number),
                  name === "income"
                    ? "Income"
                    : name === "expense"
                    ? "Expenses"
                    : "Net",
                ]}
                labelClassName="text-neutral-200"
              />
              <Bar dataKey="income" />
              <Bar dataKey="expense" />
              <Bar dataKey="net" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40">
      <div className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
