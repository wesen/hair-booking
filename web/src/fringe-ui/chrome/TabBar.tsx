import { color } from '../../tokens';

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
}

// iOS-style bottom tab bar. 4 tabs, icon + label, optional badge on one tab.

export function TabBar({ activeTab, onTabChange, accentColor = color.coral }: TabBarProps) {
  const tabs: TabItem[] = [
    { key: 'Today',   label: 'TODAY',   icon: '▤' },
    { key: 'Clients', label: 'CLIENTS', icon: '◎' },
    { key: 'Inbox',   label: 'INBOX',   icon: '✉', badge: 3 },
    { key: 'You',     label: 'YOU',     icon: '◉' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      background: color.paper,
      borderTop: `1px solid ${color.rule}`,
      display: 'flex',
      paddingBottom: 14,
    }}>
      {tabs.map(tab => {
        const on = tab.key === activeTab;
        return (
          <div
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
            <div style={{
              fontFamily: '"Anton", Impact, sans-serif',
              fontSize: 16,
              color: on ? color.ink : color.soft,
            }}>
              {tab.icon}
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: 1.2,
              color: on ? color.ink : color.soft,
            }}>
              {tab.label}
            </div>
            {tab.badge != null && (
              <div style={{
                position: 'absolute',
                top: 10,
                right: 'calc(50% - 18px)',
                width: 16,
                height: 16,
                borderRadius: 999,
                background: accentColor,
                color: color.paper,
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

// Client portal tab bar variant (different tabs)
export function ClientTabBar({ activeTab, onTabChange }: Omit<TabBarProps, 'accentColor'>) {
  const tabs = [
    { key: 'Home',    label: 'HOME',    icon: '▤' },
    { key: 'Book',    label: 'BOOK',    icon: '＋' },
    { key: 'History', label: 'HISTORY', icon: '◷' },
    { key: 'Account', label: 'ACCOUNT', icon: '◉' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      background: color.paper,
      borderTop: `1px solid ${color.rule}`,
      display: 'flex',
      paddingBottom: 14,
    }}>
      {tabs.map(tab => {
        const on = tab.key === activeTab;
        return (
          <div
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
            <div style={{
              fontFamily: '"Anton", Impact, sans-serif',
              fontSize: 16,
              color: on ? color.ink : color.soft,
            }}>
              {tab.icon}
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: 1.2,
              color: on ? color.ink : color.soft,
            }}>
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}