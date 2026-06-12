import type { CSSProperties } from 'react';

interface TabItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

interface TabBarProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  accentColor?: string;
  style?: CSSProperties;
}

// Stylist bottom tab bar. 4 tabs, icon + label, optional badge.
export function TabBar({ activeTab, onTabChange, accentColor = "#e8573c", style }: TabBarProps) {
  const tabs: TabItem[] = [
    { key: 'Today',   label: 'TODAY',   icon: '▤' },
    { key: 'Clients', label: 'CLIENTS', icon: '◎' },
    { key: 'Inbox',   label: 'INBOX',   icon: '✉', badge: 3 },
    { key: 'You',     label: 'YOU',     icon: '◉' },
  ];

  return (
    <div data-component="TabBar" style={{
      display: 'flex',
      padding: '16px 8px 24px',
      borderTop: '1px solid #e8e3da',
      background: '#faf8f5',
      ...style,
    }}>
      {tabs.map(tab => {
        const on = tab.key === activeTab;
        return (
          <div data-component="TabBar"
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div data-component="TabBar" style={{
              fontFamily: '"Anton", Impact, sans-serif',
              fontSize: 18,
              color: on ? '#111111' : '#9a958e',
            }}>
              {tab.icon}
            </div>
            <div data-component="TabBar" style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: 1.2,
              color: on ? '#111111' : '#9a958e',
            }}>
              {tab.label}
            </div>
            {tab.badge != null && (
              <div data-component="TabBar" style={{
                position: 'absolute',
                top: -4,
                right: 'calc(50% - 16px)',
                width: 16,
                height: 16,
                borderRadius: 999,
                background: accentColor,
                color: '#faf8f5',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {tab.badge}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Client portal tab bar — keys match portalSlice PortalTab type:
// "home" | "appointments" | "photos" | "rewards"
export function ClientTabBar({ activeTab, onTabChange, style }: Omit<TabBarProps, 'accentColor'>) {
  const tabs: TabItem[] = [
    { key: 'home',        label: 'HOME',   icon: '▤' },
    { key: 'appointments', label: 'BOOK',   icon: '＋' },
    { key: 'photos',      label: 'PHOTOS', icon: '◷' },
    { key: 'rewards',     label: 'POINTS', icon: '◉' },
  ];

  return (
    <div data-component="TabBar" style={{
      display: 'flex',
      padding: '16px 8px 24px',
      borderTop: '1px solid #e8e3da',
      background: '#faf8f5',
      ...style,
    }}>
      {tabs.map(tab => {
        const on = tab.key === activeTab;
        return (
          <div data-component="TabBar"
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <div data-component="TabBar" style={{
              fontFamily: '"Anton", Impact, sans-serif',
              fontSize: 18,
              color: on ? '#111111' : '#9a958e',
            }}>
              {tab.icon}
            </div>
            <div data-component="TabBar" style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: 1.2,
              color: on ? '#111111' : '#9a958e',
            }}>
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}