
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy-load feature shells (keeps initial bundle tiny)
const FinanceShell = lazy(() => import("@/features/finance/Shell"));

// Lightweight placeholders for now
const HealthShell = lazy(() => import("@/features/health/Shell"));
const WorkShell = lazy(() => import("@/features/work/Shell"));
const MindShell = lazy(() => import("@/features/mind/Shell"));

import Home from "@/features/finance/pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-neutral-400">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/finance/*" element={<FinanceShell />} />
          <Route path="/health/*" element={<HealthShell />} />
          <Route path="/work/*" element={<WorkShell />} />
          <Route path="/mind/*" element={<MindShell />} />
          {/* safety: unknown → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
