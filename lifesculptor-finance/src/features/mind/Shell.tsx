import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import { Brain, BookOpen, Sparkles, Settings as Cog } from "lucide-react";

function MindHome() {
  return <div>Mind Home</div>;
}
function Principles() {
  return <div>Principles</div>;
}
function Ideas() {
  return <div>Ideas</div>;
}
function MindSettings() {
  return <div>Settings</div>;
}

export default function MindShell() {
  const items = [
    { to: "/mind", label: "Dashboard", end: true, icon: Brain },
    { to: "/mind/principles", label: "Principles", icon: BookOpen },
    { to: "/mind/ideas", label: "Ideas", icon: Sparkles },
    { to: "/mind/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Mind" items={items} />}>
      <Routes>
        <Route index element={<MindHome />} />
        <Route path="principles" element={<Principles />} />
        <Route path="ideas" element={<Ideas />} />
        <Route path="settings" element={<MindSettings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
