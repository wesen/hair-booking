import type { CSSProperties } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface SummaryRowProps {
  label: string;
  value: string;
  onEdit?: () => void;
  /** When true, use ink-colored dividers and values (for use on colored accent panels) */
  accent?: boolean;
  style?: CSSProperties;
}

export function SummaryRow({ label, value, onEdit, accent, style }: SummaryRowProps) {
  const dividerColor = accent ? 'rgba(17,17,17,0.25)' : color.ruleSoft;
  const labelColor = accent ? 'rgba(17,17,17,0.6)' : color.soft;
  const editColor = accent ? 'rgba(17,17,17,0.7)' : color.plum;
  return (
    <div data-component="SummaryRow" style={{
      padding: '16px 0',
      borderTop: `1px solid ${dividerColor}`,
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
          color: labelColor,
          marginBottom: 4,
        }}>
          {label}
        </div>
        <div data-component="SummaryRow" style={{
          fontFamily: font.block,
          fontSize: 18,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          color: accent ? 'rgba(17,17,17,0.85)' : color.ink,
          textAlign: accent ? 'right' : 'left',
        }}>
          {value}
        </div>
      </div>
      {onEdit && !accent && (
        <div data-component="SummaryRow"
          onClick={onEdit}
          style={{
            fontFamily: font.serif,
            fontStyle: 'italic',
            fontSize: 14,
            color: editColor,
            cursor: 'pointer',
          }}
        >
          edit
        </div>
      )}
    </div>
  );
}