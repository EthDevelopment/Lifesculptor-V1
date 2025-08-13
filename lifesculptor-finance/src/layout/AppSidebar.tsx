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
  const iconClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center justify-center rounded-md transition-colors w-full",
      isActive
        ? "bg-neutral-800 text-white"
        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white",
    ].join(" ");

  return (
    <div className="h-full flex flex-col">
      {/* Title acts as Home */}
      <NavLink to="/" className="text-lg font-bold mb-4 text-white block">
        {title}
      </NavLink>

      {/* App switcher: vertical icon rail */}
      <div className="flex-1 flex flex-col justify-between">
        <NavLink to="/finance" className={iconClass} title="Finance" style={{ flexGrow: 1 }}>
          <PiggyBank size={28} />
        </NavLink>
        <NavLink to="/health" className={iconClass} title="Health" style={{ flexGrow: 1 }}>
          <HeartPulse size={28} />
        </NavLink>
        <NavLink to="/work" className={iconClass} title="Work" style={{ flexGrow: 1 }}>
          <Briefcase size={28} />
        </NavLink>
        <NavLink to="/mind" className={iconClass} title="Mind" style={{ flexGrow: 1 }}>
          <Brain size={28} />
        </NavLink>
      </div>

      {/* Global settings at bottom */}
      <div className="pt-4 mt-auto border-t border-neutral-800">
        <NavLink to="/settings" className={iconClass} title="Settings" style={{ width: "100%" }}>
          <Cog size={28} />
        </NavLink>
      </div>
    </div>
  );
}
