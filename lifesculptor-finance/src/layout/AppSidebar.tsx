import { NavLink } from "react-router-dom";
import { type ComponentType } from "react";
import { PiggyBank, HeartPulse, Briefcase, Brain } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon?: ComponentType<{ size?: number }>;
};

export default function AppSidebar({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-neutral-800 text-white"
        : "text-neutral-300 hover:bg-neutral-800 hover:text-white",
    ].join(" ");

  return (
    <div className="w-full">
      <NavLink to="/" className="text-lg font-bold mb-4 text-white block">
        {title}
      </NavLink>
      {/* Quick navigation icons */}
      <div className="flex items-center gap-2 mb-5">
        <NavLink
          to="/finance"
          className={({ isActive }) =>
            [
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-neutral-800 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white",
            ].join(" ")
          }
          title="Finance"
        >
          <PiggyBank size={18} />
        </NavLink>
        <NavLink
          to="/health"
          className={({ isActive }) =>
            [
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-neutral-800 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white",
            ].join(" ")
          }
          title="Health"
        >
          <HeartPulse size={18} />
        </NavLink>
        <NavLink
          to="/work"
          className={({ isActive }) =>
            [
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-neutral-800 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white",
            ].join(" ")
          }
          title="Work"
        >
          <Briefcase size={18} />
        </NavLink>
        <NavLink
          to="/mind"
          className={({ isActive }) =>
            [
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-neutral-800 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white",
            ].join(" ")
          }
          title="Mind"
        >
          <Brain size={18} />
        </NavLink>
      </div>
      <nav className="space-y-1">
        {items.map(({ to, label, end, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            {Icon ? <Icon size={16} /> : null}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
