import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";

export default function HistoricalSnapshotModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const addSnapshot = useFinanceStore((s) => s.addSnapshot);
  const netWorthAt = useFinanceStore((s) => s.netWorthAt);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [creditAvailable, setCreditAvailable] = useState("");
  const [creditUsed, setCreditUsed] = useState("");
  const [investments, setInvestments] = useState("");
  const [bankCash, setBankCash] = useState("");

  const expected = useMemo(
    () => netWorthAt(new Date(date)),
    [netWorthAt, date]
  );

  const snapshotNW =
    (bankCash ? Number(bankCash) : 0) +
    (investments ? Number(investments) : 0) -
    (creditUsed ? Number(creditUsed) : 0);

  const diff = snapshotNW - expected;

  const save = () => {
    addSnapshot({
      date,
      creditAvailable: creditAvailable ? Number(creditAvailable) : undefined,
      creditUsed: creditUsed ? Number(creditUsed) : 0,
      investments: investments ? Number(investments) : 0,
      bankCash: bankCash ? Number(bankCash) : 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add historical data</h3>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-neutral-300 col-span-2">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>

          <label className="text-sm text-neutral-300">
            Credit available
            <input
              inputMode="decimal"
              placeholder="e.g. 3000"
              value={creditAvailable}
              onChange={(e) => setCreditAvailable(e.target.value)}
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>

          <label className="text-sm text-neutral-300">
            Credit used (balance)
            <input
              inputMode="decimal"
              placeholder="e.g. 1250"
              value={creditUsed}
              onChange={(e) => setCreditUsed(e.target.value)}
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>

          <label className="text-sm text-neutral-300">
            Investment total
            <input
              inputMode="decimal"
              placeholder="e.g. 14000"
              value={investments}
              onChange={(e) => setInvestments(e.target.value)}
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>

          <label className="text-sm text-neutral-300">
            Bank / cash total
            <input
              inputMode="decimal"
              placeholder="e.g. 2400"
              value={bankCash}
              onChange={(e) => setBankCash(e.target.value)}
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>
        </div>

        {/* Recon block */}
        <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-900/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">
              Expected (from transactions)
            </span>
            <span>£{expected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-neutral-400">Snapshot net worth</span>
            <span>£{snapshotNW.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-neutral-400">Difference</span>
            <span
              className={
                diff === 0 ? "" : diff > 0 ? "text-emerald-400" : "text-red-400"
              }
            >
              £{diff.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>

        <p className="mt-3 text-xs text-neutral-400">
          Snapshots anchor your historical net worth only. They do not affect
          income/expense tracking.
        </p>
      </div>
    </div>
  );
}
