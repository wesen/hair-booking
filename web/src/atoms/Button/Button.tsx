import type { ReactNode, CSSProperties } from 'react';
import { color, font, radius } from '../../fringe-ui/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '10px 14px', fontSize: 13, letterSpacing: 1.2 },
  md: { padding: '14px 20px', fontSize: 16, letterSpacing: 1.8 },
  lg: { padding: '17px 26px', fontSize: 19, letterSpacing: 2.2 },
};

const variants: Record<ButtonVariant, CSSProperties> = {
  primary:   { background: color.plum,      color: color.paper, border: 'none' },
  secondary: { background: 'transparent',   color: color.ink,    border: `1px solid ${color.ink}` },
  ghost:     { background: 'transparent',   color: color.ink,    border: 'none' },
  danger:    { background: color.coral,     color: color.paper, border: 'none' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button data-component="Button"
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: font.block,
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: disabled ? 0.5 : 1,
        borderRadius: radius.md,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}