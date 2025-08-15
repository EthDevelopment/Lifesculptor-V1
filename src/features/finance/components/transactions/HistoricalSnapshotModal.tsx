import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/domains/finance/store";

export default function HistoricalSnapshotModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const addSnapshot = useFinanceStore((s) => s.addSnapshot);
  const netWorthAt = useFinanceStore((s) => s.netWorthAt);
  const accounts = useFinanceStore((s) => s.accounts);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const reconcileAccountsAt = useFinanceStore((s) => s.reconcileAccountsAt);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [creditAvailable, setCreditAvailable] = useState("");
  const [creditUsed, setCreditUsed] = useState("");
  const [investments, setInvestments] = useState("");
  const [bankCash, setBankCash] = useState("");

  // NEW
  const [syncAccounts, setSyncAccounts] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(accounts.map((a) => [a.id, ""]))
  );

  const expected = useMemo(
    () => netWorthAt(new Date(date)),
    [netWorthAt, date]
  );

  const snapshotNW =
    (bankCash ? Number(bankCash) : 0) +
    (investments ? Number(investments) : 0) -
    (creditUsed ? Number(creditUsed) : 0);

  const diff = snapshotNW - expected;

  const setBalance = (id: string, v: string) =>
    setBalances((b) => ({ ...b, [id]: v }));

  const addNewAccountInline = () => {
    const name = prompt("Account name?");
    if (!name) return;
    const type = (prompt("Type (cash, bank, credit, investment)?", "bank") ||
      "bank") as any;
    const id = addAccount({ name, type, currency: "GBP" });
    setBalances((b) => ({ ...b, [id]: "" }));
  };

  const save = () => {
    const baseInput: any = {
      date,
      creditAvailable: creditAvailable ? Number(creditAvailable) : undefined,
      creditUsed: creditUsed ? Number(creditUsed) : 0,
      investments: investments ? Number(investments) : 0,
      bankCash: bankCash ? Number(bankCash) : 0,
    };

    if (syncAccounts) {
      const targets: Record<string, number> = {};
      for (const [id, v] of Object.entries(balances)) {
        const trimmed = v.trim();
        if (trimmed === "") continue;
        targets[id] = Number(trimmed);
      }

      baseInput.accountBalances = targets;

      // Create adjustment txns at the snapshot date to hit targets
      reconcileAccountsAt(date, targets);

      // If user left totals empty, derive from targets for snapshot record
      if (!bankCash && !creditUsed && !investments) {
        let bc = 0,
          cu = 0,
          inv = 0;
        for (const [accId, amt] of Object.entries(targets)) {
          const acc = accounts.find((a) => a.id === accId);
          if (!acc) continue;
          if (acc.type === "credit") cu += Math.max(0, amt);
          else if (acc.type === "investment") inv += amt;
          else bc += amt;
        }
        baseInput.bankCash = bc;
        baseInput.creditUsed = cu;
        baseInput.investments = inv;
      }
    }

    addSnapshot(baseInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
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

        {/* Sync accounts toggle + balances */}
        <div className="mt-4 border-t border-neutral-800 pt-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={syncAccounts}
              onChange={(e) => setSyncAccounts(e.target.checked)}
            />
            <span>
              Sync accounts (reconcile per‑account balances at this date)
            </span>
          </label>

          {syncAccounts && (
            <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-neutral-200">
                  Account balances at this date
                </div>
                <Button variant="secondary" onClick={addNewAccountInline}>
                  + Add account
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {accounts.map((a) => (
                  <label key={a.id} className="text-sm text-neutral-300">
                    {a.name}{" "}
                    <span className="text-neutral-500">({a.type})</span>
                    <input
                      inputMode="decimal"
                      placeholder="—"
                      value={balances[a.id] ?? ""}
                      onChange={(e) => setBalance(a.id, e.target.value)}
                      className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                Leave blank to keep an account unchanged. Positive numbers for
                assets; for credit cards, enter positive outstanding balance.
              </p>
            </div>
          )}
        </div>

        {/* Recon preview */}
        <div className="mt-4 rounded-md border border-neutral-800 bg-neutral-900/40 p-3 text-sm">
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
          When “Sync accounts” is enabled, we post adjustment entries to set
          each account to the amounts you entered (these are excluded from
          income/expense charts).
        </p>
      </div>
    </div>
  );
}
