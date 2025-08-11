import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import { HeartPulse, Activity, Notebook, Settings as Cog } from "lucide-react";

function HealthHome() {
  return <div>Health Home</div>;
}
function Metrics() {
  return <div>Metrics</div>;
}
function Journal() {
  return <div>Journal</div>;
}
function HealthSettings() {
  return <div>Settings</div>;
}

export default function HealthShell() {
  const items = [
    { to: "/health", label: "Dashboard", end: true, icon: HeartPulse },
    { to: "/health/metrics", label: "Metrics", icon: Activity },
    { to: "/health/journal", label: "Journal", icon: Notebook },
    { to: "/health/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Health" items={items} />}>
      <Routes>
        <Route index element={<HealthHome />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="journal" element={<Journal />} />
        <Route path="settings" element={<HealthSettings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
