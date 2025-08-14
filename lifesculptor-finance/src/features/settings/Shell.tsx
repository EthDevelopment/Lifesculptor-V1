import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import Dashboard from "@/features/settings/pages/Dashboard";

import { Briefcase, ListChecks, BarChart2, Brain } from "lucide-react";

function Placeholder() {
  return <div>Coming Soon</div>;
}

export default function SettingsShell() {
  const items = [
    { to: "/settings/finance", label: "Finance", end: true, icon: Briefcase },
    { to: "/settings/health", label: "Health", icon: ListChecks },
    { to: "/settings/work", label: "Work", icon: BarChart2 },
    { to: "/settings/mind", label: "Mind", icon: Brain },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Settings" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="finance" element={<Placeholder />} />
        <Route path="health" element={<Placeholder />} />
        <Route path="work" element={<Placeholder />} />
        <Route path="mind" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
