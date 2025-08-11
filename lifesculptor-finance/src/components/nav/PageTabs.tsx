import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export type PageTab = {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
};

export default function PageTabs({ items }: { items: PageTab[] }) {
  return (
    <div className="mb-4">
      <div className="inline-flex gap-2 rounded-md border border-neutral-800 bg-neutral-950/70 p-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end ?? true}
            className={({ isActive }) =>
              [
                "px-3 py-1.5 text-xs rounded-md transition-colors inline-flex items-center gap-1",
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-300 hover:bg-neutral-900",
              ].join(" ")
            }
          >
            {it.icon}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
