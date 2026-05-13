import type { CSSProperties } from 'react';
import { color, font, radius } from '../../fringe-ui/tokens';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children?: string;
  shape?: 'pill' | 'square';
  style?: CSSProperties;
}

export function Chip({
  selected,
  onClick,
  children,
  shape = 'pill',
  style,
}: ChipProps) {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: font.block,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1,
        padding: '6px 12px 4px',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${selected ? color.plum : color.rule}`,
        background: selected ? color.plum : 'transparent',
        color: selected ? color.paper : color.ink,
        borderRadius: shape === 'pill' ? radius.pill : radius.sm,
        display: 'inline-block',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}