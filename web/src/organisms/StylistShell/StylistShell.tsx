import type { ReactNode, CSSProperties } from 'react';
import { TabBar } from '../../molecules/TabBar/TabBar';

interface StylistShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  accentColor?: string;
  style?: CSSProperties;
}

// Content shell for the stylist dashboard.
// Renders TabBar at the bottom if onTabChange is provided.

export function StylistShell({
  children,
  activeTab = 'Today',
  onTabChange,
  accentColor = "#e8573c",
  style,
}: StylistShellProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf8f5',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <div style={{ flex: 1 }}>{children}</div>

      {onTabChange && (
        <TabBar
          activeTab={activeTab}
          onTabChange={onTabChange}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}