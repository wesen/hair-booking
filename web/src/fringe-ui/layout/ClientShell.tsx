import type { ReactNode, CSSProperties } from 'react';
import { color } from '../../tokens';
import { StatusBar }      from '../chrome/StatusBar';
import { HomeIndicator }  from '../chrome/HomeIndicator';
import { ClientTabBar }   from '../chrome/TabBar';

interface ClientShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  style?: CSSProperties;
}

// Client portal shell — home / upcoming / history / account
// Includes StatusBar at top, optional ClientTabBar at bottom

export function ClientShell({
  children,
  activeTab = 'Home',
  onTabChange,
  style,
}: ClientShellProps) {
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
        paddingBottom: 80, // space for tab bar
      }}>
        {children}
      </div>

      {onTabChange && (
        <ClientTabBar activeTab={activeTab} onTabChange={onTabChange} />
      )}

      <HomeIndicator />
    </div>
  );
}