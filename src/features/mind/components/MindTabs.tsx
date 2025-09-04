// src/features/mind/components/MindTabs.tsx
import PageTabs from "@/components/nav/PageTabs";
import { Brain, Heart, BarChart2, Focus as FocusIcon, Settings as Cog } from "lucide-react";

export default function MindTabs({
  tab,
  onChange,
}: {
  tab: "overview" | "journaling" | "ideas" | "focus" | "settings";
  onChange: (k: string) => void;
}) {
  return (
    <PageTabs
      activeKey={tab}
      onChange={onChange}
      items={[
        { key: "overview", label: "Overview", icon: <Brain size={14} /> },
        { key: "journaling", label: "Journaling", icon: <Heart size={14} /> },
        { key: "ideas", label: "Ideas", icon: <BarChart2 size={14} /> },
        { key: "focus", label: "Focus", icon: <FocusIcon size={14} /> },
        { key: "settings", label: "Settings", icon: <Cog size={14} /> },
      ]}
    />
  );
}
