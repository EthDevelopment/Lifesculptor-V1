type TileColor = "emerald" | "red" | "amber" | "violet" | "sky";
const activeByColor: Record<TileColor, string> = {
  emerald:
    "bg-emerald-900/30 text-emerald-300 ring-emerald-500/40 shadow-[0_0_0_2px_rgba(16,185,129,.25)]",
  red: "bg-red-900/30 text-red-300 ring-red-300/40 shadow-[0_0_0_2px_rgba(239,68,68,.25)]",
  amber:
    "bg-amber-900/30 text-amber-300 ring-amber-500/40 shadow-[0_0_0_2px_rgba(245,158,11,.25)]",
  violet:
    "bg-violet-900/30 text-violet-300 ring-violet-500/40 shadow-[0_0_0_2px_rgba(139,92,246,.25)]",
  sky: "bg-sky-900/30 text-sky-300 ring-sky-500/40 shadow-[0_0_0_2px_rgba(14,165,233,.25)]",
};
import { NavLink } from "react-router-dom";
import { type ComponentType } from "react";
import {
  PiggyBank,
  HeartPulse,
  Briefcase,
  Brain,
  Settings as Cog,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon?: ComponentType<{ size?: number }>;
};

export default function AppSidebar({
  title,
  // keep items for backward-compat but unused now
  items: _items,
}: {
  title: string;
  items: NavItem[];
}) {
  const baseTile =
    "block w-full h-full rounded-lg ring-1 ring-neutral-800 transition-colors flex items-center justify-center";

  const tileClass = (isActive: boolean, color: TileColor) =>
    [
      baseTile,
      isActive
        ? activeByColor[color]
        : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-white",
    ].join(" ");

  return (
    <div className="h-full flex flex-col p-3">
      {/* Title acts as Home */}
      <NavLink to="/" className="text-lg font-bold mb-4 text-white block">
        {title}
      </NavLink>

      {/* Evenly distributed icon tiles */}
      <div className="grid grid-rows-5 gap-3 flex-1">
        <NavLink
          to="/finance"
          className={({ isActive }) => tileClass(isActive, "emerald")}
          aria-label="Finance"
          title="Finance"
        >
          <PiggyBank size={28} />
        </NavLink>
        <NavLink
          to="/health"
          className={({ isActive }) => tileClass(isActive, "red")}
          aria-label="Health"
          title="Health"
        >
          <HeartPulse size={28} />
          <span className="sr-only">Health</span>
        </NavLink>
        <NavLink
          to="/work"
          className={({ isActive }) => tileClass(isActive, "amber")}
          aria-label="Work"
          title="Work"
        >
          <Briefcase size={28} />
        </NavLink>
        <NavLink
          to="/mind"
          className={({ isActive }) => tileClass(isActive, "violet")}
          aria-label="Mind"
          title="Mind"
        >
          <Brain size={28} />
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => tileClass(isActive, "sky")}
          aria-label="Settings"
          title="Settings"
        >
          <Cog size={28} />
        </NavLink>
      </div>
    </div>
  );
}
