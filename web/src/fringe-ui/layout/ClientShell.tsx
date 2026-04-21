import type { ReactNode, CSSProperties } from 'react';

interface ClientShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  style?: CSSProperties;
}

// Content shell for the client portal.
// No StatusBar / HomeIndicator — just the scrollable content with optional ClientTabBar.

export function ClientShell({
  children,
  onTabChange,
  style,
}: ClientShellProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fringe-color-paper, #faf8f5)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <div style={{ flex: 1 }}>{children}</div>

      {onTabChange && (
        <div style={{
          borderTop: '1px solid var(--fringe-color-rule, #e8e3da)',
        }} />
      )}
    </div>
  );
}