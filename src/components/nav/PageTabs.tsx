import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageTabItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export default function PageTabs({
  items,
  activeKey,
  onChange,
  className,
}: {
  items: PageTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-neutral-900/60 p-1",
        className
      )}
      role="tablist"
      aria-label="Page section tabs"
    >
      {items.map((it) => {
        const active = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-emerald-600/20 text-emerald-300"
                : "text-neutral-300 hover:bg-neutral-800"
            )}
          >
            {it.icon ? <span className="-ml-0.5">{it.icon}</span> : null}
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
