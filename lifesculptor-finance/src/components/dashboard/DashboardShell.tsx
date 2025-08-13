import type { ReactNode } from "react";

export default function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </header>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
