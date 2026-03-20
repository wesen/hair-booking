import type { Tab, IconName } from "../types";
import { Icon } from "./Icon";

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: "home", icon: "home", label: "Home" },
  { id: "schedule", icon: "calendar", label: "Schedule" },
  { id: "clients", icon: "users", label: "Clients" },
  { id: "loyalty", icon: "star", label: "Loyalty" },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div data-part="tab-bar">
      {TABS.map(t => (
        <button
          key={t.id}
          data-part="tab-item"
          data-active={t.id === activeTab || undefined}
          onClick={() => onTabChange(t.id)}
        >
          <Icon name={t.icon} size={20} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
