import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Pencil, Save, Trash2 } from "lucide-react";

type Transferish = "transfer" | "invest" | "debt";

export default function Transactions() {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const [open, setOpen] = useState(false);
  const [openHistorical, setOpenHistorical] = useState(false);

  // Historical snapshots
  const snapshots = useFinanceStore((s) => s.snapshots);
  const deleteSnapshot = useFinanceStore((s) => s.deleteSnapshot);
  const updateSnapshot = useFinanceStore((s) => s.updateSnapshot);

  const accountName = (id?: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const expenseCats = useMemo(
    () => categories.filter((c) => c.kind === "expense"),
    [categories]
  );
  const incomeCats = useMemo(
    () => categories.filter((c) => c.kind === "income"),
    [categories]
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpenHistorical(true)}>
            Add historical data
          </Button>
          <Button onClick={() => setOpen(true)}>Add Transaction</Button>
        </div>
      </div>

      {/* Transactions table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="text-left px-4 py-2 w-28">Date</th>
              <th className="text-left px-4 py-2">From</th>
              <th className="text-left px-4 py-2">To / Category</th>
              <th className="text-right px-4 py-2 w-32">Amount</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Note</th>
              <th className="px-2 py-2 w-24 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr className="border-t border-neutral-800">
                <td
                  className="px-4 py-6 text-center text-neutral-400"
                  colSpan={7}
                >
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <EditableRow
                  key={t.id}
                  txn={t}
                  accounts={accounts}
                  incomeCats={incomeCats}
                  expenseCats={expenseCats}
                  onDelete={() => deleteTransaction(t.id)}
                  accountName={accountName}
                  categoryName={categoryName}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Historical snapshots table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Historical data</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-300">
              <tr>
                <th className="text-left px-4 py-2 w-28">Date</th>
                <th className="text-right px-4 py-2">Credit available</th>
                <th className="text-right px-4 py-2">Credit used</th>
                <th className="text-right px-4 py-2">Investments</th>
                <th className="text-right px-4 py-2">Bank / cash</th>
                <th className="text-right px-4 py-2">Net worth</th>
                <th className="px-2 py-2 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr className="border-t border-neutral-800">
                  <td
                    className="px-4 py-6 text-center text-neutral-400"
                    colSpan={7}
                  >
                    No historical snapshots yet. Click “Add historical data”.
                  </td>
                </tr>
              ) : (
                snapshots.map((s) => (
                  <EditableSnapshotRow
                    key={s.id}
                    snap={s}
                    onSave={(patch) => updateSnapshot(s.id, patch)}
                    onDelete={() => {
                      if (confirm("Delete this historical snapshot?")) {
                        deleteSnapshot(s.id);
                      }
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open ? <AddTransactionDrawer onClose={() => setOpen(false)} /> : null}
      {openHistorical ? (
        <HistoricalSnapshotModal onClose={() => setOpenHistorical(false)} />
      ) : null}
    </div>
  );
}

/** Inline‑editable transaction row */
function EditableRow({
  txn,
  accounts,
  incomeCats,
  expenseCats,
  onDelete,
  accountName,
  categoryName,
}: {
  txn: {
    id: string;
    type: "income" | "expense" | "transfer" | "invest" | "debt";
    date: string;
    accountId: string;
    transferAccountId?: string;
    categoryId?: string;
    amount: number;
    note?: string;
  };
  accounts: { id: string; name: string; type: string }[];
  incomeCats: { id: string; name: string }[];
  expenseCats: { id: string; name: string }[];
  onDelete: () => void;
  accountName: (id?: string) => string;
  categoryName: (id?: string) => string;
}) {
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const [editing, setEditing] = useState(false);

  // Local form state for edit mode
  const [date, setDate] = useState(txn.date.slice(0, 10));
  const [type, setType] = useState(txn.type);
  const [fromId, setFromId] = useState(txn.accountId);
  const [toId, setToId] = useState(txn.transferAccountId ?? "");
  const [categoryId, setCategoryId] = useState(txn.categoryId ?? "");
  const [amount, setAmount] = useState(txn.amount.toString());
  const [note, setNote] = useState(txn.note ?? "");

  const isTransferish = (t: string): t is Transferish =>
    t === "transfer" || t === "invest" || t === "debt";

  const toOptions = accounts.filter((a) => {
    if (!isTransferish(type)) return false;
    if (a.id === fromId) return false;
    if (type === "invest") return a.type === "investment";
    if (type === "debt") return a.type === "credit";
    return true; // transfer
  });

  const save = () => {
    const amt = Number(amount);
    if (!fromId || !date || !amt || amt <= 0) return;

    const patch: any = {
      date: new Date(date).toISOString(),
      type,
      accountId: fromId,
      amount: amt,
      note: note || undefined,
    };

    if (isTransferish(type)) {
      if (!toId) return; // must choose destination
      patch.transferAccountId = toId;
      patch.categoryId = undefined;
    } else {
      patch.categoryId = categoryId || undefined;
      patch.transferAccountId = undefined;
    }

    updateTransaction(txn.id, patch);
    setEditing(false);
  };

  return (
    <tr className="border-t border-neutral-800 hover:bg-neutral-800/60">
      {/* Date */}
      <td className="px-4 py-2 w-28 whitespace-nowrap">
        {editing ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
          />
        ) : (
          <span className="font-bold">
            {new Date(txn.date).toLocaleDateString()}
          </span>
        )}
      </td>

      {/* From account */}
      <td className="px-4 py-2">
        {editing ? (
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          accountName(txn.accountId)
        )}
      </td>

      {/* To / Category */}
      <td className="px-4 py-2">
        {editing ? (
          isTransferish(type) ? (
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
            >
              <option value="">Select account</option>
              {toOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          ) : type === "income" ? (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
            >
              {incomeCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
            >
              {expenseCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )
        ) : isTransferish(txn.type) ? (
          accountName(txn.transferAccountId)
        ) : (
          categoryName(txn.categoryId)
        )}
      </td>

      {/* Amount */}
      <td className="px-4 py-2 w-32 text-right tabular-nums">
        {editing ? (
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 text-right"
          />
        ) : txn.type === "income" ? (
          <span className="text-green-400 font-medium">{`£${txn.amount.toFixed(
            2
          )}`}</span>
        ) : txn.type === "expense" ? (
          <span className="text-red-400 font-medium">{`£${txn.amount.toFixed(
            2
          )}`}</span>
        ) : (
          <span>{`£${txn.amount.toFixed(2)}`}</span>
        )}
      </td>

      {/* Type */}
      <td className="px-4 py-2 capitalize">
        {editing ? (
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="invest">Invest</option>
            <option value="debt">Pay Debt</option>
          </select>
        ) : (
          txn.type
        )}
      </td>

      {/* Note */}
      <td className="px-4 py-2 max-w-[280px] truncate">
        {editing ? (
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 w-full"
          />
        ) : (
          txn.note ?? ""
        )}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 w-24">
        <div className="flex items-center justify-center gap-2">
          {editing ? (
            <button
              aria-label="Save"
              onClick={save}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300"
              title="Save"
            >
              <Save size={16} />
            </button>
          ) : (
            <button
              aria-label="Edit"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800 text-blue-400 hover:text-blue-300"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            aria-label="Delete transaction"
            onClick={() => {
              if (confirm("Delete this transaction?")) onDelete();
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/** Inline‑editable historical snapshot row */
function EditableSnapshotRow({
  snap,
  onSave,
  onDelete,
}: {
  snap: {
    id: string;
    date: string;
    bankCash?: number;
    creditUsed?: number;
    creditAvailable?: number;
    investments?: number;
  };
  onSave: (patch: {
    date?: string;
    bankCash?: number;
    creditUsed?: number;
    creditAvailable?: number;
    investments?: number;
  }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const [date, setDate] = useState(snap.date.slice(0, 10));
  const [creditAvailable, setCreditAvailable] = useState<string>(
    (snap.creditAvailable ?? "").toString()
  );
  const [creditUsed, setCreditUsed] = useState<string>(
    (snap.creditUsed ?? 0).toString()
  );
  const [investments, setInvestments] = useState<string>(
    (snap.investments ?? 0).toString()
  );
  const [bankCash, setBankCash] = useState<string>(
    (snap.bankCash ?? 0).toString()
  );

  const numeric = (s: string) => (s.trim() === "" ? 0 : Number(s));

  const netWorth =
    numeric(bankCash) + numeric(investments) - numeric(creditUsed);

  const save = () => {
    onSave({
      date: new Date(date).toISOString().slice(0, 10),
      creditAvailable:
        creditAvailable.trim() === "" ? undefined : Number(creditAvailable),
      creditUsed: numeric(creditUsed),
      investments: numeric(investments),
      bankCash: numeric(bankCash),
    });
    setEditing(false);
  };

  return (
    <tr className="border-t border-neutral-800 hover:bg-neutral-900/40">
      {/* Date */}
      <td className="px-4 py-2 w-28 whitespace-nowrap">
        {editing ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
          />
        ) : (
          new Date(snap.date).toLocaleDateString()
        )}
      </td>

      {/* Credit available */}
      <td className="px-4 py-2 text-right tabular-nums">
        {editing ? (
          <input
            inputMode="decimal"
            value={creditAvailable}
            onChange={(e) => setCreditAvailable(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 text-right"
            placeholder="0"
          />
        ) : (
          `£${(snap.creditAvailable ?? 0).toFixed(2)}`
        )}
      </td>

      {/* Credit used */}
      <td className="px-4 py-2 text-right tabular-nums">
        {editing ? (
          <input
            inputMode="decimal"
            value={creditUsed}
            onChange={(e) => setCreditUsed(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 text-right"
            placeholder="0"
          />
        ) : (
          `£${(snap.creditUsed ?? 0).toFixed(2)}`
        )}
      </td>

      {/* Investments */}
      <td className="px-4 py-2 text-right tabular-nums">
        {editing ? (
          <input
            inputMode="decimal"
            value={investments}
            onChange={(e) => setInvestments(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 text-right"
            placeholder="0"
          />
        ) : (
          `£${(snap.investments ?? 0).toFixed(2)}`
        )}
      </td>

      {/* Bank / cash */}
      <td className="px-4 py-2 text-right tabular-nums">
        {editing ? (
          <input
            inputMode="decimal"
            value={bankCash}
            onChange={(e) => setBankCash(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2 text-right"
            placeholder="0"
          />
        ) : (
          `£${(snap.bankCash ?? 0).toFixed(2)}`
        )}
      </td>

      {/* Net worth */}
      <td className="px-4 py-2 text-right tabular-nums font-medium">
        £
        {(editing
          ? netWorth
          : (snap.bankCash ?? 0) +
            (snap.investments ?? 0) -
            (snap.creditUsed ?? 0)
        ).toFixed(2)}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 w-24">
        <div className="flex items-center justify-center gap-2">
          {editing ? (
            <button
              aria-label="Save snapshot"
              onClick={save}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300"
              title="Save"
            >
              <Save size={16} />
            </button>
          ) : (
            <button
              aria-label="Edit snapshot"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800 text-blue-400 hover:text-blue-300"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            aria-label="Delete snapshot"
            onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* -------- AddTransactionDrawer -------- */
function AddTransactionDrawer({ onClose }: { onClose: () => void }) {
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

    if (type === "transfer" || type === "invest" || type === "debt") {
      if (!toId) return;
      addTransaction({ ...base, transferAccountId: toId });
    } else {
      if (!categoryId) return;
      addTransaction({ ...base, categoryId });
    }

    onClose();
  };

  const isTransferish =
    type === "transfer" || type === "invest" || type === "debt";

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

function HistoricalSnapshotModal({ onClose }: { onClose: () => void }) {
  const addSnapshot = useFinanceStore((s) => s.addSnapshot);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [creditAvailable, setCreditAvailable] = useState("");
  const [creditUsed, setCreditUsed] = useState("");
  const [investments, setInvestments] = useState("");
  const [bankCash, setBankCash] = useState("");

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
