import { Fragment, useMemo, useState } from "react";
import { useFinanceStore } from "@/domains/finance/store";
import { ChevronDown, ChevronRight, Trash2, Pencil, Save } from "lucide-react";

// Local inline transaction row that matches the unified table's column count (8 cols)
function TransactionSubRow({
  txn,
  accounts,
  incomeCats,
  expenseCats,
  accountName,
  categoryName,
  onDelete,
}: any) {
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const [editing, setEditing] = useState(false);

  const [date, setDate] = useState(txn.date.slice(0, 10));
  const [type, setType] = useState(txn.type);
  const [fromId, setFromId] = useState(txn.accountId);
  const [toId, setToId] = useState(txn.transferAccountId ?? "");
  const [categoryId, setCategoryId] = useState(txn.categoryId ?? "");
  const [amount, setAmount] = useState(txn.amount.toString());
  const [note, setNote] = useState(txn.note ?? "");

  type Transferish = "transfer" | "invest" | "debt";
  const isTransferish = (t: string): t is Transferish =>
    t === "transfer" || t === "invest" || t === "debt";

  const toOptions = accounts.filter((a: any) => {
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
    <tr className="border-t border-neutral-900/50 hover:bg-neutral-800/50">
      {/* spacer to align under chevron column */}
      <td className="px-3 w-10" />

      {/* Date */}
      <td className="px-4 py-2 w-36 whitespace-nowrap">
        {editing ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 rounded-md bg-neutral-900 border border-neutral-700 px-2"
          />
        ) : (
          <span className="font-medium">
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
            {accounts.map((a: any) => (
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
              {toOptions.map((a: any) => (
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
              {incomeCats.map((c: any) => (
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
              {expenseCats.map((c: any) => (
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
      <td className="px-4 py-2 w-28 text-right tabular-nums">
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
      <td className="px-4 py-2 capitalize w-24">
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
      <td className="px-4 py-2 max-w-[260px] truncate">
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
      <td className="px-2 py-2 w-20 text-center">
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 ml-1"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

export default function TransactionsTable() {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const snapshots = useFinanceStore((s) => s.snapshots);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const deleteSnapshot = useFinanceStore((s) => s.deleteSnapshot);

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

  const groups = useMemo(() => {
    const snaps = [...snapshots].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    ); // newest first
    const txns = [...transactions].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    ); // newest first

    if (snaps.length === 0) {
      return [
        {
          id: "_no_snapshot",
          title: "All activity",
          date: null as Date | null,
          creditAvailable: undefined as number | undefined,
          creditUsed: 0,
          investments: 0,
          bankCash: 0,
          netWorth: null as number | null,
          txns,
        },
      ];
    }

    const out: Array<{
      id: string;
      title: string;
      date: Date;
      creditAvailable?: number;
      creditUsed?: number;
      investments?: number;
      bankCash?: number;
      netWorth: number;
      txns: typeof transactions;
    }> = [];

    for (let i = 0; i < snaps.length; i++) {
      const s = snaps[i];
      const next = snaps[i + 1]; // next = older
      const sEnd = new Date(s.date + "T23:59:59"); // include this day
      const nextEnd = next ? new Date(next.date + "T23:59:59") : null; // lower bound (exclusive)

      const bucket = txns.filter((t) => {
        const td = new Date(t.date);
        const leqCurrent = td <= sEnd; // up to and including current checkpoint date
        const gtNext = nextEnd ? td > nextEnd : true; // strictly after the next older checkpoint
        return leqCurrent && gtNext;
      });

      const netWorth =
        (s.bankCash ?? 0) + (s.investments ?? 0) - (s.creditUsed ?? 0);

      out.push({
        id: s.id,
        title: new Date(s.date).toLocaleDateString(),
        date: sEnd,
        creditAvailable: s.creditAvailable,
        creditUsed: s.creditUsed ?? 0,
        investments: s.investments ?? 0,
        bankCash: s.bankCash ?? 0,
        netWorth,
        txns: bucket,
      });
    }

    return out;
  }, [snapshots, transactions]);

  // Expand state per group id
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800">
      <table className="min-w-full text-sm table-fixed">
        <thead className="bg-neutral-900 text-neutral-300">
          <tr>
            <th className="px-3 w-10"></th>
            <th className="text-left px-4 py-2 w-36">Checkpoint / Date</th>
            <th className="text-right px-4 py-2 w-28">Credit avail.</th>
            <th className="text-right px-4 py-2 w-28">Credit used</th>
            <th className="text-right px-4 py-2 w-28">Investments</th>
            <th className="text-right px-4 py-2 w-28">Bank / cash</th>
            <th className="text-right px-4 py-2 w-32">Net worth</th>
            <th className="px-2 py-2 w-20 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <Fragment key={g.id}>
              {/* Checkpoint row */}
              <tr
                key={g.id}
                className="border-t border-neutral-800 bg-neutral-950/60"
              >
                <td className="px-3 align-middle">
                  <button
                    aria-label={open[g.id] ? "Collapse" : "Expand"}
                    onClick={() => toggle(g.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100"
                  >
                    {open[g.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </td>
                <td className="px-4 py-2 font-medium">{g.title}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {g.creditAvailable === undefined
                    ? "—"
                    : `£${g.creditAvailable.toFixed(2)}`}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  £{(g.creditUsed ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  £{(g.investments ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  £{(g.bankCash ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold">
                  {typeof g.netWorth === "number"
                    ? `£${g.netWorth.toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-2 py-2 text-center">
                  {g.id !== "_no_snapshot" && (
                    <button
                      aria-label="Delete snapshot"
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this snapshot? Transactions remain unaffected."
                          )
                        ) {
                          deleteSnapshot(g.id);
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>

              {/* Transaction subheader + rows */}
              {open[g.id] && (
                <>
                  <tr className="bg-neutral-900/50 text-neutral-300">
                    <td className="px-3 w-10" />
                    <td className="px-4 py-2 w-36">Date</td>
                    <td className="px-4 py-2">From</td>
                    <td className="px-4 py-2">To / Category</td>
                    <td className="px-4 py-2 text-right w-28">Amount</td>
                    <td className="px-4 py-2 w-24">Type</td>
                    <td className="px-4 py-2">Note</td>
                    <td className="px-2 py-2 w-20 text-center">Actions</td>
                  </tr>

                  {g.txns.length === 0 ? (
                    <tr className="border-t border-neutral-900/50">
                      <td />
                      <td className="px-4 py-3 text-neutral-400" colSpan={7}>
                        No transactions between this checkpoint and the next.
                      </td>
                    </tr>
                  ) : (
                    g.txns.map((t) => (
                      <TransactionSubRow
                        key={t.id}
                        txn={t}
                        accounts={accounts}
                        incomeCats={incomeCats}
                        expenseCats={expenseCats}
                        accountName={accountName}
                        categoryName={categoryName}
                        onDelete={() => deleteTransaction(t.id)}
                      />
                    ))
                  )}
                </>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
