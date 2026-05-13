import type { CSSProperties } from 'react';
import { color, type as typeToken } from '../../fringe-ui/tokens';

interface BudgetOptionProps {
  label: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function BudgetOption({
  label,
  description,
  selected = false,
  onClick,
  style,
}: BudgetOptionProps) {
  return (
    <div
      data-component="BudgetOption"
      data-part={selected ? 'selected' : undefined}
      onClick={onClick}
      style={{
        padding: '16px 18px',
        marginBottom: 8,
        background: selected ? color.peachSoft : color.cream,
        borderLeft: `3px solid ${selected ? color.plum : 'transparent'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Radio indicator */}
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        border: `2px solid ${selected ? color.plum : color.soft}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && (
          <div style={{ width: 8, height: 8, borderRadius: 999, background: color.plum }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...typeToken.h3, fontSize: 19 }}>{label}</div>
        <div style={{ ...typeToken.bodySm, color: color.softInk, marginTop: 2 }}>{description}</div>
      </div>
    </div>
  );
}
