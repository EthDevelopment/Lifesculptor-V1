import type { ReactNode } from "react";

export default function MetricCard({
  label,
  value,
  hint,
  intent = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  intent?: "default" | "success" | "warning" | "danger";
}) {
  const ring =
    intent === "success"
      ? "ring-emerald-500/20"
      : intent === "warning"
      ? "ring-amber-500/20"
      : intent === "danger"
      ? "ring-red-500/20"
      : "ring-neutral-700/40";

  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-925/60 ring-1 ${ring}`}
    >
      <div className="p-4 md:p-5">
        <div className="text-xs uppercase tracking-wide text-neutral-400">
          {label}
        </div>
        <div className="mt-1.5 text-2xl font-semibold text-white">{value}</div>
        {hint ? (
          <div className="mt-1 text-xs text-neutral-400">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
