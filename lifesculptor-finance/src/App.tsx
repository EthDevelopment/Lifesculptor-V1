import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";

export default function App() {
  const addTxn = useFinanceStore((s) => s.addTransaction);
  const netWorth = useFinanceStore((s) => s.netWorth());
  const monthInc = useFinanceStore((s) => s.monthIncome());
  const monthExp = useFinanceStore((s) => s.monthExpenses());
  const savingsRate = useFinanceStore((s) => s.savingsRate());

  const seed = () => {
    const add = useFinanceStore.getState().addTransaction;
    add({
      type: "income",
      accountId: "acc-monzo",
      amount: 4200,
      categoryId: "cat-salary",
      date: new Date().toISOString(),
    });
    add({
      type: "expense",
      accountId: "acc-monzo",
      amount: 2850,
      categoryId: "cat-rent",
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 space-y-6">
      <div className="space-x-2">
        <Button onClick={seed}>Seed month</Button>
        <Button
          variant="secondary"
          onClick={() =>
            addTxn({
              type: "expense",
              accountId: "acc-monzo",
              amount: 12.99,
              categoryId: "cat-eatingout",
              date: new Date().toISOString(),
            })
          }
        >
          Add £12.99 expense
        </Button>
      </div>

      <div className="text-sm text-neutral-300 space-y-1">
        <div>Net worth: £{netWorth.toFixed(2)}</div>
        <div>Monthly income: £{monthInc.toFixed(2)}</div>
        <div>Monthly expenses: £{monthExp.toFixed(2)}</div>
        <div>Savings rate: {(savingsRate * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}
