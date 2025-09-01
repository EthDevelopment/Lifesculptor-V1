import { useState } from "react";
import { useFinanceStore } from "@/domains/finance/store";
import { Pencil, Save, Trash2 } from "lucide-react";

type Transferish = "transfer" | "invest" | "debt";

export default function TransactionRow({
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
    return true;
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
      if (!toId) return;
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

      {/* From */}
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
          <span className="text-green-400 font-medium">
            £{txn.amount.toFixed(2)}
          </span>
        ) : txn.type === "expense" ? (
          <span className="text-red-400 font-medium">
            £{txn.amount.toFixed(2)}
          </span>
        ) : (
          <span>£{txn.amount.toFixed(2)}</span>
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
