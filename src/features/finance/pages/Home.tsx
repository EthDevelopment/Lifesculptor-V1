import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import {
  PiggyBank,
  HeartPulse,
  Briefcase,
  Brain,
  Sparkles,
  Shield,
  Rocket,
} from "lucide-react";

// A lucide icon component signature
type LucideIcon = ComponentType<{ size?: number; className?: string }>;

// Tile color options
type TileColor = "emerald" | "red" | "amber" | "violet" | "sky";

// Card definition for the arena grid
type CardDef = {
  title: string;
  to: string;
  icon: LucideIcon;
  desc: string;
  color: TileColor;
};

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
  red: "hover:bg-red-900/30 hover:text-red-300 hover:ring-red-300/40 hover:shadow-[0_0_0_2px_rgba(239,68,68,.25)]",
  amber:
    "hover:bg-amber-900/30 hover:text-amber-300 hover:ring-amber-500/40 hover:shadow-[0_0_0_2px_rgba(245,158,11,.25)]",
  violet:
    "hover:bg-violet-900/30 hover:text-violet-300 hover:ring-violet-500/40 hover:shadow-[0_0_0_2px_rgba(139,92,246,.25)]",
  sky: "hover:bg-sky-900/30 hover:text-sky-300 hover:ring-sky-500/40 hover:shadow-[0_0_0_2px_rgba(14,165,233,.25)]",
};

const bgByColor: Record<TileColor, string> = {
  emerald: "bg-emerald-500/20",
  red: "bg-red-500/20",
  amber: "bg-amber-500/20",
  violet: "bg-violet-500/20",
  sky: "bg-sky-500/20",
};

const cards: CardDef[] = [
  {
    title: "Finance",
    to: "/finance",
    icon: PiggyBank,
    desc: "Track net worth, cashflow, and plan ahead.",
    color: "emerald",
  },
  {
    title: "Health",
    to: "/health",
    icon: HeartPulse,
    desc: "Habits, metrics, and training (coming soon).",
    color: "red",
  },
  {
    title: "Work",
    to: "/work",
    icon: Briefcase,
    desc: "Projects, tasks, and systems (coming soon).",
    color: "amber",
  },
  {
    title: "Mind",
    to: "/mind",
    icon: Brain,
    desc: "Principles, reflections, and learning (coming soon).",
    color: "violet",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl" />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* Header */}
      <header className="border-b border-neutral-800/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
            LifeSculptor
          </h1>
          <p className="mt-1 text-sm text-neutral-300/80">
            Transform your life, one system at a time
          </p>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto mt-16 max-w-7xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left: headline, copy, CTAs, value props */}
            <div className="md:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-300">
                <Sparkles size={14} /> Build a life you’re proud of
              </span>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Design your life,
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
                  one system at a time.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-neutral-400">
                Four focused arenas. Clean tools. Your data. Start with one
                pillar and watch momentum compound across the rest.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/finance"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-emerald-50 shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  Create account
                </Link>
                <a
                  href="#areas"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
                >
                  Explore all areas
                </a>
              </div>

              {/* Value props */}
              <ul className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                <li className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 p-5">
                  <Shield className="mb-2 text-neutral-300" size={18} />
                  <p className="text-sm text-neutral-300">Private-first</p>
                  <p className="text-xs text-neutral-400">
                    Local-first storage by default.
                  </p>
                </li>
                <li className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 p-5">
                  <Rocket className="mb-2 text-neutral-300" size={18} />
                  <p className="text-sm text-neutral-300">Frictionless</p>
                  <p className="text-xs text-neutral-400">
                    Fast, focused, minimal UI.
                  </p>
                </li>
                <li className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 p-5">
                  <Sparkles className="mb-2 text-neutral-300" size={18} />
                  <p className="text-sm text-neutral-300">Compounding</p>
                  <p className="text-xs text-neutral-400">
                    Progress carries across pillars.
                  </p>
                </li>
              </ul>
            </div>

            {/* Right: subscribe panel */}
            <aside className="md:col-span-4">
              <div className="sticky top-6 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-6 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-2 py-1 text-[11px] text-neutral-300">
                  <Sparkles size={12} />
                  Early access &amp; updates
                </div>
                <h3 className="text-xl font-semibold text-neutral-100">
                  Stay in the loop
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  New features, principles, and prompts that help you compound
                  progress. No spam, unsubscribe anytime.
                </p>

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    inputMode="email"
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 text-sm font-medium text-white shadow hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    aria-label="Subscribe for updates"
                    title="Subscribe for updates"
                  >
                    Subscribe
                  </button>
                </form>

                <ul className="mt-4 space-y-2 text-xs text-neutral-400">
                  <li className="flex items-center gap-2">
                    <Shield size={14} className="text-neutral-300" />
                    We’ll never share your email.
                  </li>
                  <li className="flex items-center gap-2">
                    <Rocket size={14} className="text-neutral-300" />
                    Occasional notes when it’s worth your time.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        {/* Areas */}
        <main id="areas" className="mx-auto max-w-7xl px-6 py-16">
          <h3 className="mb-4 text-sm uppercase tracking-wider text-neutral-400">
            Choose your arena
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ title, desc, icon: Icon, to, color }) => (
              <Link
                key={to}
                to={to}
                className={`group rounded-3xl border bg-neutral-900 p-6 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 ${activeByColor[color]} ${hoverByColor[color]}`}
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bgByColor[color]}`}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/70">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-neutral-500">
          “We are what we repeatedly do. Excellence, then, is not an act, but a
          habit.”
          <span className="text-neutral-400"> — Aristotle</span>
        </div>
      </footer>
    </div>
  );
}
