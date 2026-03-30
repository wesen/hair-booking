import type { PortalTab } from "../types";

interface PortalTabBarProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  showPhotos?: boolean;
  showRewards?: boolean;
}

const TABS: { id: PortalTab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "appointments", icon: "📅", label: "Appts" },
  { id: "photos", icon: "📷", label: "Photos" },
  { id: "rewards", icon: "⭐", label: "Rewards" },
];

export function PortalTabBar({ activeTab, onTabChange, showPhotos = true, showRewards = true }: PortalTabBarProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "photos") {
      return showPhotos;
    }
    if (tab.id === "rewards") {
      return showRewards;
    }
    return true;
  });

  return (
    <div data-part="portal-tab-bar">
      {visibleTabs.map(t => (
        <button
          key={t.id}
          data-part="portal-tab-item"
          data-active={t.id === activeTab || undefined}
          onClick={() => onTabChange(t.id)}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
