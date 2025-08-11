import type { PropsWithChildren, ReactNode } from "react";

export default function FeatureShell({
  sidebar,
  children,
}: PropsWithChildren<{ sidebar: ReactNode }>) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Full-width layout so the sidebar sits flush against the left edge */}
      <div className="flex min-h-screen">
        {/* Sidebar (fixed width, full height) */}
        <aside className="hidden sm:block w-64 shrink-0 border-r border-neutral-800 bg-neutral-950/80">
          <div className="sticky top-0 h-screen p-4">{sidebar}</div>
        </aside>

        {/* Main content area; constrain width INSIDE the content, not the whole layout */}
        <section className="flex-1 flex min-h-screen flex-col">
          <div className="p-6 mx-auto w-full max-w-6xl flex-1">{children}</div>
        </section>
      </div>
    </div>
  );
}
