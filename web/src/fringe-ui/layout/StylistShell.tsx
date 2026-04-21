import type { ReactNode, CSSProperties } from 'react';

interface StylistShellProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  accentColor?: string;
  style?: CSSProperties;
}

// Content shell for the stylist dashboard.
// No StatusBar / HomeIndicator — just the scrollable content with optional TabBar.
// Pages render their own header chrome as needed.

export function StylistShell({
  children,
  onTabChange,
  accentColor,
  style,
}: StylistShellProps) {
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
          paddingTop: 0,
        }}>
          {/* Tab bar renders here — see TabBar component */}
        </div>
      )}
    </div>
  );
}