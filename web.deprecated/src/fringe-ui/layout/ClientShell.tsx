import type { ReactNode, CSSProperties } from 'react';
import { ClientTabBar } from '../chrome/TabBar';

interface ClientShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  style?: CSSProperties;
}

// Content shell for the client portal.
// Renders ClientTabBar at the bottom if onTabChange is provided.

export function ClientShell({
  children,
  activeTab = 'Home',
  onTabChange,
  style,
}: ClientShellProps) {
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
        <ClientTabBar
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </div>
  );
}