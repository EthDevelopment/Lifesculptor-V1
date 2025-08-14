import { Link } from "react-router-dom";
import { PiggyBank, HeartPulse, Briefcase, Brain } from "lucide-react";

type TileColor = "emerald" | "red" | "amber" | "violet" | "sky";

const activeByColor: Record<TileColor, string> = {
  emerald:
    "border-emerald-500 text-emerald-300 ring-emerald-500/40 shadow-[0_0_0_2px_rgba(16,185,129,.25)]",
  red: "border-red-300 text-red-300 ring-red-300/40 shadow-[0_0_0_2px_rgba(239,68,68,.25)]",
  amber:
    "border-amber-500 text-amber-300 ring-amber-500/40 shadow-[0_0_0_2px_rgba(245,158,11,.25)]",
  violet:
    "border-violet-500 text-violet-300 ring-violet-500/40 shadow-[0_0_0_2px_rgba(139,92,246,.25)]",
  sky: "border-sky-500 text-sky-300 ring-sky-500/40 shadow-[0_0_0_2px_rgba(14,165,233,.25)]",
};

const hoverByColor: Record<TileColor, string> = {
  emerald:
    "hover:bg-emerald-900/30 hover:text-emerald-300 hover:ring-emerald-500/40 hover:shadow-[0_0_0_2px_rgba(16,185,129,.25)]",
  red:
    "hover:bg-red-900/30 hover:text-red-300 hover:ring-red-300/40 hover:shadow-[0_0_0_2px_rgba(239,68,68,.25)]",
  amber:
    "hover:bg-amber-900/30 hover:text-amber-300 hover:ring-amber-500/40 hover:shadow-[0_0_0_2px_rgba(245,158,11,.25)]",
  violet:
    "hover:bg-violet-900/30 hover:text-violet-300 hover:ring-violet-500/40 hover:shadow-[0_0_0_2px_rgba(139,92,246,.25)]",
  sky:
    "hover:bg-sky-900/30 hover:text-sky-300 hover:ring-sky-500/40 hover:shadow-[0_0_0_2px_rgba(14,165,233,.25)]",
};

const bgByColor: Record<TileColor, string> = {
  emerald: "bg-emerald-500/20",
  red: "bg-red-500/20",
  amber: "bg-amber-500/20",
  violet: "bg-violet-500/20",
  sky: "bg-sky-500/20",
};

const cards = [
  {
    title: "Finance",
    to: "/finance",
    icon: PiggyBank,
    desc: "Track net worth, cashflow, and plan ahead.",
    color: "emerald" as TileColor,
  },
  {
    title: "Health",
    to: "/health",
    icon: HeartPulse,
    desc: "Habits, metrics, and training (coming soon).",
    color: "red" as TileColor,
  },
  {
    title: "Work",
    to: "/work",
    icon: Briefcase,
    desc: "Projects, tasks, and systems (coming soon).",
    color: "amber" as TileColor,
  },
  {
    title: "Mind",
    to: "/mind",
    icon: Brain,
    desc: "Principles, reflections, and learning (coming soon).",
    color: "violet" as TileColor,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-semibold">LifeSculptor</h1>
          <p className="text-neutral-400">Where the journey begins</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ title, desc, icon: Icon, to, color }) => (
            <Link
              key={to}
              to={to}
              className={`group rounded-2xl border bg-neutral-900 p-5 focus:outline-none focus:ring-2 ${activeByColor[color]} ${hoverByColor[color]}`}
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bgByColor[color]} text-${color}-300`}
              >
                <Icon size={18} />
              </div>
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-1 text-sm text-neutral-400">{desc}</p>
              <div className="mt-4 text-xs text-neutral-400">Open →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
