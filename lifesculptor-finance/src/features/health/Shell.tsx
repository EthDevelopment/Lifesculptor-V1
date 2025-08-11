import { Link, Outlet, Routes, Route } from "react-router-dom";

function HealthHome() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Health</h1>
      <p className="text-neutral-400 mt-1">Coming soon.</p>
    </div>
  );
}

export default function HealthShell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="font-medium">Health</div>
          <Link to="/" className="text-sm text-neutral-400 hover:text-white">
            ← Home
          </Link>
        </nav>
        <Routes>
          <Route index element={<HealthHome />} />
          <Route path="*" element={<HealthHome />} />
        </Routes>
        <Outlet />
      </div>
    </div>
  );
}
