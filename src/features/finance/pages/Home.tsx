import { Link } from "react-router-dom";
import { PiggyBank, HeartPulse, Briefcase, Brain } from "lucide-react";

const cards = [
  {
    title: "Finance",
    to: "/finance",
    icon: PiggyBank,
    desc: "Track net worth, cashflow, and plan ahead.",
  },
  {
    title: "Health",
    to: "/health",
    icon: HeartPulse,
    desc: "Habits, metrics, and training (coming soon).",
  },
  {
    title: "Work",
    to: "/work",
    icon: Briefcase,
    desc: "Projects, tasks, and systems (coming soon).",
  },
  {
    title: "Mind",
    to: "/mind",
    icon: Brain,
    desc: "Principles, reflections, and learning (coming soon).",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-semibold">LifeSculptor</h1>
          <p className="text-neutral-400">Choose an area to open.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ title, desc, icon: Icon, to }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-700"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 group-hover:bg-neutral-700">
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
