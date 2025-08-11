import { useFinanceStore } from "@/features/finance/stores/useFinanceStore";
import HistoricalSnapshotRow from "./HistoricalSnapshotRow";

export default function HistoricalDataTable() {
  const snapshots = useFinanceStore((s) => s.snapshots);
  const deleteSnapshot = useFinanceStore((s) => s.deleteSnapshot);
  const updateSnapshot = useFinanceStore((s) => s.updateSnapshot);

  return (
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
              <HistoricalSnapshotRow
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
  );
}
