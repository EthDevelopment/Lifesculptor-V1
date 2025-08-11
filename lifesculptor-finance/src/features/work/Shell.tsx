import { Routes, Route, Navigate } from "react-router-dom";
import FeatureShell from "@/layout/FeatureShell";
import AppSidebar from "@/layout/AppSidebar";

import {
  Briefcase,
  ListChecks,
  CalendarDays,
  Settings as Cog,
} from "lucide-react";

function WorkHome() {
  return <div>Work Home</div>;
}
function Projects() {
  return <div>Projects</div>;
}
function Calendar() {
  return <div>Calendar</div>;
}
function WorkSettings() {
  return <div>Settings</div>;
}

export default function WorkShell() {
  const items = [
    { to: "/work", label: "Dashboard", end: true, icon: Briefcase },
    { to: "/work/projects", label: "Projects", icon: ListChecks },
    { to: "/work/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/work/settings", label: "Settings", icon: Cog },
  ];

  return (
    <FeatureShell sidebar={<AppSidebar title="LS - Work" items={items} />}>
      <Routes>
        <Route index element={<WorkHome />} />
        <Route path="projects" element={<Projects />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<WorkSettings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </FeatureShell>
  );
}
