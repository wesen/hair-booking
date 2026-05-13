import type { CSSProperties } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface SegmentedProps {
  options: Array<{ value: string; label: string } | string>;
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export function Segmented({ options, value, onChange, style }: SegmentedProps) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${color.ink}`, ...style }}>
      {options.map((o, i) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const sel = val === value;

        return (
          <button
            key={val}
            onClick={() => onChange?.(val)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontFamily: font.block,
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: 'uppercase' as const,
              background: sel ? color.ink : 'transparent',
              color: sel ? color.paper : color.ink,
              border: 'none',
              borderLeft: i ? `1px solid ${color.ink}` : 'none',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}