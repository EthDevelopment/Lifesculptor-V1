import { useFinanceStore } from "@/stores/useFinanceStore";

export default function Dashboard() {
  const netWorth = useFinanceStore((s) => s.netWorth());
  const monthInc = useFinanceStore((s) => s.monthIncome());
  const monthExp = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Net worth" value={`£${netWorth.toFixed(2)}`} />
        <KpiCard label="Monthly income" value={`£${monthInc.toFixed(2)}`} />
        <KpiCard label="Monthly expenses" value={`£${monthExp.toFixed(2)}`} />
        <KpiCard
          label="Savings rate"
          value={`${(savingsRate * 100).toFixed(1)}%`}
        />
      </div>
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
