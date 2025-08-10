import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";

export default function Transactions() {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);

  const [open, setOpen] = useState(false);

  const accountName = (id?: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button onClick={() => setOpen(true)}>Add Transaction</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Account</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr className="border-t border-neutral-800">
                <td
                  className="px-4 py-6 text-center text-neutral-400"
                  colSpan={6}
                >
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-t border-neutral-800">
                  <td className="px-4 py-2">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{accountName(t.accountId)}</td>
                  <td className="px-4 py-2">{categoryName(t.categoryId)}</td>
                  <td className="px-4 py-2 text-right">
                    £{t.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 capitalize">{t.type}</td>
                  <td className="px-4 py-2">{t.note ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open ? <AddTransactionDrawer onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function AddTransactionDrawer({ onClose }: { onClose: () => void }) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);

  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense"
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.kind === "expense")?.id ?? ""
  );
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>("");

  const submit = () => {
    const amt = Number(amount);
    if (!accountId || !amt || amt <= 0) return;
    addTransaction({
      type,
      accountId,
      amount: amt,
      categoryId: type === "transfer" ? undefined : categoryId,
      date: new Date(date).toISOString(),
      note: note || undefined,
    });
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
              </select>
            </label>

            <label className="text-sm text-neutral-300">
              Account
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
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

          {type !== "transfer" && (
            <label className="text-sm text-neutral-300 block">
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
              >
                {categories
                  .filter(
                    (c) => c.kind === (type === "income" ? "income" : "expense")
                  )
                  .map((c) => (
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
