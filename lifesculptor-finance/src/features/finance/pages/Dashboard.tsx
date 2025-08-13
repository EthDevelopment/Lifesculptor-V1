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
// 1) ADD this import near the top with the others
import TransactionsTable from "@/features/finance/components/transactions/TransactionsTable";

/* ---------- lightweight embedded panels ---------- */

function AccountsPanel() {
  const accounts = useFinanceStore((s) => s.accounts);
  const balanceBy = useFinanceStore((s) => s.balanceByAccount);
  const total = accounts.reduce((sum, a) => sum + balanceBy(a.id), 0);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60">
      <div className="flex items-center justify-between border-b border-neutral-800 p-3">
        <h3 className="text-sm text-neutral-300">Your Accounts</h3>
        <div className="text-sm text-emerald-400 font-medium">{gbp(total)}</div>
      </div>
      <div className="divide-y divide-neutral-800">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between px-3 py-2"
          >
            <div className="text-sm">
              <div className="text-neutral-200">{a.name}</div>
              <div className="text-xs text-neutral-500 capitalize">
                {a.type}
              </div>
            </div>
            <div className="text-sm tabular-nums">{gbp(balanceBy(a.id))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsPanel() {
  const txns = useFinanceStore((s) => s.transactions).slice(0, 10);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);

  const nameOf = (id?: string, kind?: "account" | "category") => {
    if (!id) return "—";
    if (kind === "account")
      return accounts.find((a) => a.id === id)?.name ?? "—";
    return categories.find((c) => c.id === id)?.name ?? "—";
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60">
      <div className="border-b border-neutral-800 p-3 text-sm text-neutral-300">
        Recent Transactions
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">From</th>
              <th className="px-3 py-2 text-left">To / Category</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {txns.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-900/40">
                <td className="px-3 py-2">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">{nameOf(t.accountId, "account")}</td>
                <td className="px-3 py-2">
                  {t.transferAccountId
                    ? nameOf(t.transferAccountId, "account")
                    : nameOf(t.categoryId, "category")}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {gbp(t.amount)}
                </td>
                <td className="px-3 py-2 capitalize">{t.type}</td>
              </tr>
            ))}
            {txns.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-6 text-center text-neutral-500"
                  colSpan={5}
                >
                  No transactions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForecastPanel() {
  // placeholder—for now just a friendly box you can replace with your real forecast
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
      Forecast coming soon… plug your projection component here.
    </div>
  );
}

/* ---------- main dashboard page ---------- */

export default function FinanceDashboard() {
  const [range, setRange] = useState<RangeKey>("12M");
  const [activeTab, setActiveTab] = useState<
    "overview" | "accounts" | "transactions" | "forecast" | "settings"
  >("overview");

  const tabs = (
    <PageTabs
      activeKey={activeTab}
      onChange={(k) => setActiveTab(k as typeof activeTab)}
      items={[
        { key: "overview", label: "Overview", icon: <PiggyBank size={14} /> },
        { key: "accounts", label: "Accounts", icon: <CreditCard size={14} /> },
        {
          key: "transactions",
          label: "Transactions",
          icon: <BarChart2 size={14} />,
        },
        { key: "forecast", label: "Forecast", icon: <BarChart2 size={14} /> },
        { key: "settings", label: "Settings", icon: <Cog size={14} /> },
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

  // derive range months (moved above metrics so nwDeltaPct exists before use)
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
    if (!months.length) return [] as { month: string; value: number }[];
    const from = months[0].date;
    const to = new Date();
    return netWorthSeriesFn(from, to).map((p) => ({
      month: format(p.date, "MMM yy"),
      value: p.value,
    }));
  }, [months, netWorthSeriesFn]);

  // compute % change across the selected range, ignoring a 0 baseline
  const nwDeltaPct = useMemo(() => {
    if (!nwSeries || nwSeries.length < 2) return 0;

    // find the first non-zero value in the series to avoid divide-by-zero
    const firstIdx = nwSeries.findIndex(
      (p) => p?.value !== 0 && p?.value != null
    );
    if (firstIdx === -1) return 0;

    const first = nwSeries[firstIdx].value ?? 0;
    const last = nwSeries[nwSeries.length - 1]?.value ?? 0;

    if (first === 0) return 0; // extra guard; shouldn't hit because of findIndex
    return ((last - first) / Math.abs(first)) * 100;
  }, [nwSeries]);

  // metrics
  const metrics: Metric[] = useMemo(() => {
    const nw = netWorthAt(new Date());
    return [
      {
        id: "nw",
        label: "Net worth",
        value: gbp(nw),
        deltaPct: Number(nwDeltaPct.toFixed(1)),
        intent:
          nwDeltaPct > 0 ? "success" : nwDeltaPct < 0 ? "danger" : undefined,
      },
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
  }, [monthIncome, monthExpenses, savingsRate, netWorthAt, nwDeltaPct]);

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

  // charts config (used when tab = overview)
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

  /* which panel to show under the tabs */
  // 3) In the tabContent selection, render the full table for the "transactions" tab
  const tabContent =
    activeTab === "overview" ? null : activeTab === "accounts" ? (
      <AccountsPanel />
    ) : activeTab === "transactions" ? (
      // Use your real checkpoint + expandable table here
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-0">
        <TransactionsTable />
      </div>
    ) : activeTab === "forecast" ? (
      <ForecastPanel />
    ) : (
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
        Settings coming soon…
      </div>
    );

  return (
    <Dashboard
      title="Dashboard"
      metrics={metrics}
      chartsTop={activeTab === "overview" ? chartsTop : undefined}
      range={range}
      onRangeChange={setRange}
      tabs={tabs}
    >
      {/* When not overview, children replace the charts area */}
      {activeTab === "overview" ? null : tabContent}
    </Dashboard>
  );
}
