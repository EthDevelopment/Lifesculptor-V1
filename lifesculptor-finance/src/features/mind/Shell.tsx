import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import Dashboard from "@/features/mind/pages/Dashboard";

import { Brain, Lightbulb, BarChart2, Settings as Cog } from "lucide-react";

function Placeholder() {
  return <div>Coming Soon</div>;
}

export default function MindShell() {
  const items = [
    { to: "/mind", label: "Dashboard", end: true, icon: Brain },
    { to: "/mind/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/mind/trends", label: "Trends", icon: BarChart2 },
    { to: "/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Mind" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="ideas" element={<Placeholder />} />
        <Route path="trends" element={<Placeholder />} />
        <Route path="settings" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
