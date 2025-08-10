import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";

export default function Accounts() {
  const accounts = useFinanceStore((s) => s.accounts);
  const balanceByAccount = useFinanceStore((s) => s.balanceByAccount);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <AddAccountInline />
      </div>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-right px-4 py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-neutral-800">
                <td className="px-4 py-2">{a.name}</td>
                <td className="px-4 py-2 capitalize">{a.type}</td>
                <td className="px-4 py-2 text-right">
                  £{balanceByAccount(a.id).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddAccountInline() {
  const addAccount = useFinanceStore((s) => s.addAccount);
  const [name, setName] = useState("");
  const [type, setType] = useState<
    "cash" | "bank" | "credit" | "savings" | "investment"
  >("bank");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addAccount({ name, type, currency: "GBP" });
        setName("");
        setType("bank");
      }}
      className="flex items-center gap-2"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Account name"
        className="h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        className="h-9 rounded-md bg-neutral-900 border border-neutral-700 px-3 text-sm"
      >
        <option value="cash">Cash</option>
        <option value="bank">Bank</option>
        <option value="credit">Credit</option>
        <option value="savings">Savings</option>
        <option value="investment">Investment</option>
      </select>
      <Button type="submit" className="h-9">
        Add
      </Button>
    </form>
  );
}
