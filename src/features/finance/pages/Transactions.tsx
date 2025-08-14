// pages/Transactions.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TransactionsTable from "@/features/finance/components/transactions/TransactionsTable";
import AddTransactionDrawer from "@/features/finance/components/transactions/AddTransactionDrawer";
import HistoricalSnapshotModal from "@/features/finance/components/transactions/HistoricalSnapshotModal";

export default function TransactionsPage() {
  const [openTxn, setOpenTxn] = useState(false);
  const [openHistorical, setOpenHistorical] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpenHistorical(true)}>
            Add historical data
          </Button>
          <Button onClick={() => setOpenTxn(true)}>Add Transaction</Button>
        </div>
      </div>

      <TransactionsTable />

      <div className="mt-8"></div>

      {openTxn && <AddTransactionDrawer onClose={() => setOpenTxn(false)} />}
      {openHistorical && (
        <HistoricalSnapshotModal onClose={() => setOpenHistorical(false)} />
      )}
    </div>
  );
}
