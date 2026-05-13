import type { CSSProperties } from 'react';
import { color, type as typeToken } from '../../fringe-ui/tokens';

interface LengthSilhouetteProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

// Height ratios for each hair length silhouette (maps to SVG path height)
const HEIGHT_MAP: Record<string, number> = {
  'Pixie': 30,
  'Bob': 52,
  'Shoulder': 72,
  'Mid-back': 100,
  'Waist': 120,
};

export function LengthSilhouette({
  label,
  selected = false,
  onClick,
  style,
}: LengthSilhouetteProps) {
  const h = HEIGHT_MAP[label] ?? 72;

  return (
    <div
      data-component="LengthSilhouette"
      data-part={selected ? 'selected' : undefined}
      onClick={onClick}
      style={{
        background: selected ? color.peachSoft : color.cream,
        border: selected
          ? `1.5px solid ${color.plum}`
          : `1px solid ${color.rule}`,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minHeight: 150,
        justifyContent: 'flex-end',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <svg viewBox="0 0 40 120" style={{ flex: 1, width: '100%' }}>
        <circle cx="20" cy="14" r="10" fill={selected ? color.plum : color.soft} />
        <path
          d={`M8 24 Q 20 ${24 + h * 0.8} 32 24`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="3"
          fill="none"
        />
        <path
          d={`M10 24 L 8 ${24 + h}`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="2"
          fill="none"
        />
        <path
          d={`M30 24 L 32 ${24 + h}`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <div style={{
        ...typeToken.eyebrow,
        color: selected ? color.plum : color.soft,
        fontSize: 10,
      }}>
        {label}
      </div>
    </div>
  );
}
