import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddTransactionDrawer from "@/components/transactions/AddTransactionDrawer";
import TransactionsTable from "@/components/transactions/TransactionsTable";
import HistoricalSnapshotModal from "@/components/transactions/HistoricalSnapshotModal";

export default function Transactions() {
  const [openTxn, setOpenTxn] = useState(false);
  const [openHistorical, setOpenHistorical] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpenHistorical(true)}>
            Add historical data
          </Button>
          <Button onClick={() => setOpenTxn(true)}>Add Transaction</Button>
        </div>
      </div>

      {/* Unified timeline table (snapshots with expandable transactions) */}
      <TransactionsTable />

      {openTxn ? (
        <AddTransactionDrawer onClose={() => setOpenTxn(false)} />
      ) : null}
      {openHistorical ? (
        <HistoricalSnapshotModal onClose={() => setOpenHistorical(false)} />
      ) : null}
    </div>
  );
}
