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
    { to: "/health/workouts", label: "Workouts", end: true, icon: Activity },
    { to: "/health/nutrition", label: "Nutrition", icon: HeartPulse },
    { to: "/health/insights", label: "Insights", icon: BarChart2 },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Health" items={items} />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="workouts" element={<Placeholder />} />
        <Route path="nutrition" element={<Placeholder />} />
        <Route path="insights" element={<Placeholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
