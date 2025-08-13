import { NavLink } from "react-router-dom";
import { type ComponentType } from "react";
import { PiggyBank, HeartPulse, Briefcase, Brain, Settings as Cog } from "lucide-react";

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

  const tileClass = ({ isActive }: { isActive: boolean }) =>
    [
      baseTile,
      isActive
        ? "bg-neutral-800 text-white ring-neutral-700"
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
        <NavLink to="/finance" className={tileClass} aria-label="Finance" title="Finance">
          <PiggyBank size={28} />
        </NavLink>
        <NavLink to="/health" className={tileClass} aria-label="Health" title="Health">
          <HeartPulse size={28} />
          <span className="sr-only">Health</span>
        </NavLink>
        <NavLink to="/work" className={tileClass} aria-label="Work" title="Work">
          <Briefcase size={28} />
        </NavLink>
        <NavLink to="/mind" className={tileClass} aria-label="Mind" title="Mind">
          <Brain size={28} />
        </NavLink>
        <NavLink to="/settings" className={tileClass} aria-label="Settings" title="Settings">
          <Cog size={28} />
        </NavLink>
      </div>
    </div>
  );
}
