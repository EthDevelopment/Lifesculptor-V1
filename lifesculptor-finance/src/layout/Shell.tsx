import { Routes, Route } from "react-router-dom";
import Sidebar from "@/layout/Sidebar";
import Topbar from "@/layout/Topbar";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Forecast from "@/pages/Forecast";
import Settings from "@/pages/Settings";

export default function Shell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
