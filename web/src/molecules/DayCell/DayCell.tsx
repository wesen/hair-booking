import type { CSSProperties } from 'react';
import { color } from '../../fringe-ui/tokens';

interface DayCellProps {
  day: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  dot?: boolean;
  style?: CSSProperties;
}

export function DayCell({ day, selected, disabled, onClick, dot, style }: DayCellProps) {
  return (
    <button data-component="DayCell"
      onClick={onClick}
      disabled={disabled}
      style={{
        aspectRatio: '1/1',
        background: selected ? color.plum : 'transparent',
        border: `1px solid ${selected ? color.plum : color.rule}`,
        color: selected ? color.paper : disabled ? color.soft : color.ink,
        fontFamily: '"Anton", Impact, sans-serif',
        fontSize: 16,
        cursor: disabled ? 'default' : 'pointer',
        position: 'relative',
        opacity: disabled ? 0.35 : 1,
        padding: 0,
        ...style,
      }}
    >
      {day}
      {dot && (
        <div data-component="DayCell" style={{
          position: 'absolute',
          bottom: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 4,
          height: 4,
          borderRadius: 2,
          background: selected ? color.peach : color.plum,
        }} />
      )}
    </button>
  );
}