import type { CSSProperties, ChangeEvent } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface TextFieldProps {
  label?: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: CSSProperties;
  onChange?: (value: string) => void;
}

export function TextField({
  label,
  value,
  placeholder,
  multiline,
  style,
  onChange,
}: TextFieldProps) {
  const baseStyle: CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: color.cream,
    border: 'none',
    fontFamily: multiline ? font.serif : font.sans,
    fontSize: multiline ? 17 : 15,
    fontStyle: multiline ? 'italic' : 'normal',
    color: color.ink,
    lineHeight: 1.45,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: multiline ? 90 : 'auto',
    ...style,
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <label style={{ display: 'block' }}>
      {label && (
        <div style={{
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          fontWeight: 600,
          color: color.plum,
          marginBottom: 8,
        }}>
          {label}
        </div>
      )}
      {multiline ? (
        <textarea
          defaultValue={value}
          placeholder={placeholder}
          onChange={handleChange}
          style={baseStyle}
        />
      ) : (
        <input
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          onChange={handleChange}
          style={baseStyle}
        />
      )}
    </label>
  );
}