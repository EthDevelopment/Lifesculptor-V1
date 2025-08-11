import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/features/finance/stores/useFinanceStore";

export default function AddTransactionDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);

  const [type, setType] = useState<
    "income" | "expense" | "transfer" | "invest" | "debt"
  >("expense");
  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState<string>("");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.kind === "expense")?.id ?? ""
  );
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>("");

  const filteredToAccounts = accounts.filter((a) => {
    if (a.id === fromId) return false;
    if (type === "invest") return a.type === "investment";
    if (type === "debt") return a.type === "credit";
    if (type === "transfer") return true;
    return false;
  });

  const isTransferish =
    type === "transfer" || type === "invest" || type === "debt";

  const submit = () => {
    const amt = Number(amount);
    if (!fromId || !amt || amt <= 0) return;

    const base = {
      type,
      accountId: fromId,
      amount: amt,
      date: new Date(date).toISOString(),
      note: note || undefined,
    } as any;

    if (isTransferish) {
      if (!toId) return;
      addTransaction({ ...base, transferAccountId: toId });
    } else {
      if (!categoryId) return;
      addTransaction({ ...base, categoryId });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-950 border-l border-neutral-800 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-neutral-300">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
                <option value="invest">Invest</option>
                <option value="debt">Pay Debt</option>
              </select>
            </label>

            <label className="text-sm text-neutral-300">
              {type === "income" ? "To account" : "From account"}
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isTransferish ? (
            <label className="text-sm text-neutral-300 block">
              To account
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              >
                <option value="" disabled>
                  Select account
                </option>
                {filteredToAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="text-sm text-neutral-300 block">
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              >
                {(type === "income"
                  ? categories.filter((c) => c.kind === "income")
                  : categories.filter((c) => c.kind === "expense")
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-neutral-300">
              Amount
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              />
            </label>
            <label className="text-sm text-neutral-300">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              />
            </label>
          </div>

          <label className="text-sm text-neutral-300 block">
            Note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <Button onClick={submit}>Save</Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
