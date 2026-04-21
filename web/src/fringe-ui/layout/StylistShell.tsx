import type { ReactNode, CSSProperties } from 'react';
import { color } from '../../tokens';
import { StatusBar }     from '../chrome/StatusBar';
import { HomeIndicator } from '../chrome/HomeIndicator';
import { TabBar }        from '../chrome/TabBar';

interface StylistShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  accentColor?: string;
  style?: CSSProperties;
}

// Stylist dashboard shell — Today / Clients / Inbox / You
// Includes StatusBar at top, TabBar at bottom, accent color for badge

export function StylistShell({
  children,
  activeTab = 'Today',
  onTabChange,
  accentColor = color.coral,
  style,
}: StylistShellProps) {
  return (
    <div style={{
      height: '100%',
      background: color.paper,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <StatusBar />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 80,
      }}>
        {children}
      </div>

      {onTabChange && (
        <TabBar activeTab={activeTab} onTabChange={onTabChange} accentColor={accentColor} />
      )}

      <HomeIndicator />
    </div>
  );
}