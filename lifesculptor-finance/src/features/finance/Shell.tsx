import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/features/finance/pages/Dashboard";
import Accounts from "@/features/finance/pages/Accounts";
import Transactions from "@/features/finance/pages/Transactions";
import Forecast from "@/features/finance/pages/Forecast";
import Settings from "@/features/finance/pages/Settings";
import Sidebar from "@/layout/Sidebar";
import Topbar from "@/layout/Topbar";

export default function FinanceShell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl flex">
        {/* Left nav */}
        <aside className="hidden sm:block w-64 shrink-0 border-r border-neutral-800 bg-neutral-950/80">
          <div className="sticky top-0 h-screen p-4">
            <Sidebar />
          </div>
        </aside>

        {/* Right content area */}
        <section className="flex-1 flex min-h-screen flex-col">
          <Topbar />
          <div className="p-6 flex-1">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="forecast" element={<Forecast />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </div>
        </section>
      </div>
    </div>
  );
}
