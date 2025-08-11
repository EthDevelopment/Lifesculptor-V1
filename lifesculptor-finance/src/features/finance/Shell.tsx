import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import Dashboard from "@/features/finance/pages/Dashboard";
import Accounts from "@/features/finance/pages/Accounts";
import Transactions from "@/features/finance/pages/Transactions";
import Forecast from "@/features/finance/pages/Forecast";
import Settings from "@/features/finance/pages/Settings";

import {
  PiggyBank,
  CreditCard,
  BarChart2,
  Settings as Cog,
} from "lucide-react";

export default function FinanceShell() {
  const items = [
    { to: "/finance", label: "Dashboard", end: true, icon: PiggyBank },
    { to: "/finance/accounts", label: "Accounts", icon: CreditCard },
    { to: "/finance/transactions", label: "Transactions", icon: BarChart2 },
    { to: "/finance/forecast", label: "Forecast", icon: BarChart2 },
    { to: "/finance/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Finance" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
