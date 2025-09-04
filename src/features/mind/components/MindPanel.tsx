// src/features/mind/components/MindPanel.tsx
import FocusPanel from "@/features/mind/components/FocusPanel";
import IdeasPanel from "@/features/mind/components/IdeasPanel";
import JournalPanel from "@/features/mind/components/JournalPanel";
import MindSettingsPanel from "@/features/mind/components/MindSettingsPanel";

export default function MindPanel({
  tab,
}: {
  tab: "overview" | "journaling" | "ideas" | "focus" | "settings";
}) {
  if (tab === "overview") return null;
  if (tab === "journaling") return <JournalPanel />;
  if (tab === "ideas") return <IdeasPanel />;
  if (tab === "focus") return <FocusPanel />;
  if (tab === "settings") return <MindSettingsPanel />;
  return null;
}
