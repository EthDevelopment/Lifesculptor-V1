import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import Dashboard from "@/features/work/pages/Dashboard";

import {
  Briefcase,
  ListChecks,
  BarChart2,
  Settings as Cog,
} from "lucide-react";

function Placeholder() {
  return <div>Coming Soon</div>;
}

export default function WorkShell() {
  const items = [
    { to: "/work", label: "Dashboard", end: true, icon: Briefcase },
    { to: "/work/projects", label: "Projects", icon: ListChecks },
    { to: "/work/performance", label: "Performance", icon: BarChart2 },
    { to: "/work/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Work" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Placeholder />} />
        <Route path="performance" element={<Placeholder />} />
        <Route path="settings" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
