import type { ReactNode } from "react";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-925/60 p-3 md:p-4">
      <div className="mb-2 text-sm text-neutral-300">{title}</div>
      {children}
    </section>
  );
}
