import type { CSSProperties } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface SummaryRowProps {
  label: string;
  value: string;
  onEdit?: () => void;
  style?: CSSProperties;
}

export function SummaryRow({ label, value, onEdit, style }: SummaryRowProps) {
  return (
    <div data-component="SummaryRow" style={{
      padding: '16px 0',
      borderTop: `1px solid ${color.ruleSoft}`,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      ...style,
    }}>
      <div data-component="SummaryRow" style={{ flex: 1 }}>
        <div data-component="SummaryRow" style={{
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          fontWeight: 600,
          color: color.soft,
          marginBottom: 4,
        }}>
          {label}
        </div>
        <div data-component="SummaryRow" style={{
          fontFamily: font.block,
          fontSize: 18,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          color: color.ink,
        }}>
          {value}
        </div>
      </div>
      {onEdit && (
        <div data-component="SummaryRow"
          onClick={onEdit}
          style={{
            fontFamily: font.serif,
            fontStyle: 'italic',
            fontSize: 14,
            color: color.plum,
            cursor: 'pointer',
          }}
        >
          edit
        </div>
      )}
    </div>
  );
}