import { useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import {
  format,
  subMonths,
  startOfMonth,
  isSameMonth,
  parseISO,
  differenceInMonths,
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
import { COLORS } from "@/constants/colors";

type RangeKey = "6m" | "12m" | "24m" | "all";

export default function Dashboard() {
  const txns = useFinanceStore((s) => s.transactions);
  const netWorthNow = useFinanceStore((s) => s.netWorth());
  const monthInc = useFinanceStore((s) => s.monthIncome());
  const monthExp = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());

  const [range, setRange] = useState<RangeKey>("12m");

  const { cashflow, netWorthSeries, hasData } = useMemo(() => {
    if (txns.length === 0)
      return { cashflow: [], netWorthSeries: [], hasData: false };

    // earliest month present in transactions
    const earliest = txns
      .map((t) => parseISO(t.date))
      .sort((a, b) => +a - +b)[0];

    // months to show
    let monthsToShow = 12;
    if (range === "6m") monthsToShow = 6;
    if (range === "24m") monthsToShow = 24;
    if (range === "all") {
      monthsToShow = Math.max(
        1,
        differenceInMonths(new Date(), startOfMonth(earliest)) + 1
      );
    }

    // build month buckets ending at current month
    const months: { date: Date; label: string }[] = [];
    const now = new Date();
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      months.push({ date: d, label: format(d, "MMM yy") });
    }

    // aggregate income/expense by month from transactions (historical + current)
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
      return { month: m.label, income, expense, net: income - expense };
    });

    // net worth line: cumulative monthly net, offset so last point equals current net worth
    const deltas = cash.map((c) => c.net);
    const cum = deltas.reduce<number[]>((arr, d, i) => {
      const prev = i === 0 ? 0 : arr[i - 1];
      arr.push(prev + d);
      return arr;
    }, []);
    const offset = netWorthNow - (cum[cum.length - 1] || 0);
    const netSeries = months.map((m, i) => ({
      month: m.label,
      netWorth: cum[i] + offset,
    }));

    return { cashflow: cash, netWorthSeries: netSeries, hasData: true };
  }, [txns, netWorthNow, range]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <RangeSelector value={range} onChange={setRange} />
      </div>

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

      {!hasData ? (
        <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40 text-neutral-400">
          Add transactions with past dates to see historical charts.
        </div>
      ) : (
        <>
          {/* Net worth history */}
          <section className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40">
            <div className="text-sm text-neutral-300 mb-2">Net worth</div>
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
                    formatter={(v) => [gbp(v as number), "Net worth"]}
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
            <div className="text-sm text-neutral-300 mb-2">
              Monthly cashflow
            </div>
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
                  <Bar dataKey="income" fill={COLORS.incomeGreen} />
                  <Bar dataKey="expense" fill={COLORS.expenseRed} />
                  <Bar dataKey="net" fill={COLORS.netWorthBlue} />
                  {/* Same blue as net worth line */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function RangeSelector({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {(["6m", "12m", "24m", "all"] as const).map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={[
            "h-8 rounded-md px-3 text-sm border",
            value === k
              ? "bg-neutral-800 border-neutral-700"
              : "bg-transparent border-neutral-800 hover:bg-neutral-900",
          ].join(" ")}
        >
          {k.toUpperCase()}
        </button>
      ))}
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
