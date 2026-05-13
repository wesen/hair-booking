import type { CSSProperties } from 'react';
import { color, type as typeToken, font } from '../../fringe-ui/tokens';

interface ServiceOptionProps {
  name: string;
  description: string;
  rate?: string;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function ServiceOption({
  name,
  description,
  rate,
  selected = false,
  onClick,
  style,
}: ServiceOptionProps) {
  return (
    <div
      data-component="ServiceOption"
      data-part={selected ? 'selected' : undefined}
      onClick={onClick}
      style={{
        padding: '14px 16px',
        marginBottom: 8,
        background: selected ? color.peachSoft : color.cream,
        borderLeft: `3px solid ${selected ? color.plum : 'transparent'}`,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ ...typeToken.h3, fontSize: 20 }}>{name}</div>
        <div style={{ ...typeToken.bodySm, color: color.softInk, marginTop: 2 }}>{description}</div>
      </div>
      {rate && (
        <div style={{ ...typeToken.meta, color: color.plum }}>{rate}</div>
      )}
    </div>
  );
}
