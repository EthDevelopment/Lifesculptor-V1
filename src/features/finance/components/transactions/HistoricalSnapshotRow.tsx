import { useState } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";

export default function HistoricalSnapshotRow({
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

      <td className="px-4 py-2 text-right tabular-nums font-medium">
        £
        {(editing
          ? netWorth
          : (snap.bankCash ?? 0) +
            (snap.investments ?? 0) -
            (snap.creditUsed ?? 0)
        ).toFixed(2)}
      </td>

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
