import { useMemo, useState } from "react";
import { useFinanceStore } from "@/features/finance/stores/useFinanceStore";
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

type RangeKey = "1m" | "6m" | "12m" | "24m" | "all";

export default function Dashboard() {
  // top of component selectors
  const txns = useFinanceStore((s) => s.transactions);
  const netWorthSeriesFn = useFinanceStore((s) => s.netWorthSeries);
  const netWorthAtFn = useFinanceStore((s) => s.netWorthAt);
  const monthInc = useFinanceStore((s) => s.monthIncome());
  const monthExp = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());

  const netWorthNow = useMemo(() => netWorthAtFn(new Date()), [netWorthAtFn]);

  const [range, setRange] = useState<RangeKey>("12m");

  const { cashflow, netWorthSeries, hasData } = useMemo(() => {
    const snapshots = useFinanceStore.getState().snapshots;

    const hasSnapshots = snapshots.length > 0;
    const hasTxns = txns.length > 0;

    // earliest date for "all"
    const earliestDate = (() => {
      const earliestTxn = hasTxns
        ? txns.map((t) => parseISO(t.date)).sort((a, b) => +a - +b)[0]
        : undefined;
      const earliestSnap = hasSnapshots
        ? parseISO(snapshots[0].date + "T00:00:00Z")
        : undefined;
      if (earliestTxn && earliestSnap)
        return +earliestTxn < +earliestSnap ? earliestTxn : earliestSnap;
      return earliestTxn || earliestSnap || new Date();
    })();

    let monthsToShow = 12;
    if (range === "1m") monthsToShow = 1;
    if (range === "6m") monthsToShow = 6;
    if (range === "24m") monthsToShow = 24;
    if (range === "all") {
      monthsToShow = Math.max(
        1,
        differenceInMonths(new Date(), startOfMonth(earliestDate)) + 1
      );
    }

    // Build month buckets for labels and for cashflow
    const months: { date: Date; label: string }[] = [];
    const now = new Date();
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      months.push({ date: d, label: format(d, "MMM yy") });
    }

    // Cashflow bars (txns only)
    const cash = months.map((m) => {
      let income = 0;
      let expense = 0;
      if (hasTxns) {
        for (const t of txns) {
          const td = parseISO(t.date);
          if (isSameMonth(td, m.date)) {
            if (t.type === "income") income += t.amount;
            if (t.type === "expense") expense += t.amount;
          }
        }
      }
      return { month: m.label, income, expense, net: income - expense };
    });

    // Net-worth line from store helper (snapshots + txns)
    const from = months[0]?.date ?? startOfMonth(now);
    const to = now;
    const series = netWorthSeriesFn(from, to).map((p) => ({
      month: format(p.date, "MMM yy"),
      netWorth: p.value,
    }));

    const someData = hasSnapshots || hasTxns;
    return { cashflow: cash, netWorthSeries: series, hasData: someData };
  }, [txns, range, netWorthSeriesFn]);

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
      {(["1m", "6m", "12m", "24m", "all"] as const).map((k) => (
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
