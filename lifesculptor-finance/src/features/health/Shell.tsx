import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import Dashboard from "@/features/health/pages/Dashboard";

import { Activity, HeartPulse, BarChart2, Settings as Cog } from "lucide-react";

function Placeholder() {
  return <div>Coming Soon</div>;
}

export default function HealthDashboard() {
  const items = [
    { to: "/health", label: "Dashboard", end: true, icon: Activity },
    { to: "/health/insights", label: "Insights", icon: HeartPulse },
    { to: "/health/trends", label: "Trends", icon: BarChart2 },
    { to: "/health/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Health" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="insights" element={<Placeholder />} />
        <Route path="trends" element={<Placeholder />} />
        <Route path="settings" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
