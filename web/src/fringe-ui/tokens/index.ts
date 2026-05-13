// fringe-ui/tokens/index.ts
// Mirrors the FS object from design-system.jsx as TypeScript constants.
// Use these for inline styles; use the CSS file for class-based styling.

export const color = {
  ink:       '#111111',
  paper:     '#ffffff',
  cream:     '#f6efe4',
  creamDeep: '#efe6d4',
  rule:      '#ebe7df',
  soft:      '#9a958e',
  softInk:   '#5b5852',
  plum:      '#6b3a4a',
  plumDeep:  '#4a2431',
  peach:     '#f2b89a',
  peachSoft: '#faddc9',
  coral:     '#e8573c',
  butter:    '#f4c752',
  ochre:     '#c48a34',
  sage:      '#7a8f6b',
  blush:     '#e6b8a8',
  success:   '#7a8f6b',
  warn:      '#c48a34',
  danger:    '#e8573c',
} as const;

export const font = {
  block: '"Anton", Impact, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  sans:  '"Inter", system-ui, sans-serif',
  mono:  '"JetBrains Mono", monospace',
} as const;

// All type tokens are React.CSSProperties — spread them onto a style object.
export const type = {
  display1:   { fontFamily: font.block, fontSize: 120, lineHeight: 0.85, letterSpacing: -2,   textTransform: 'uppercase' as const },
  display2:   { fontFamily: font.block, fontSize: 72,  lineHeight: 0.9,  letterSpacing: -1,   textTransform: 'uppercase' as const },
  display3:   { fontFamily: font.block, fontSize: 54,  lineHeight: 0.9,  letterSpacing: -0.5, textTransform: 'uppercase' as const },
  h1:         { fontFamily: font.block, fontSize: 36,  lineHeight: 1,    letterSpacing: 0.3,   textTransform: 'uppercase' as const },
  h2:         { fontFamily: font.block, fontSize: 26,  lineHeight: 1,    letterSpacing: 0.3,   textTransform: 'uppercase' as const },
  h3:         { fontFamily: font.block, fontSize: 20,  lineHeight: 1.05, letterSpacing: 0.5,   textTransform: 'uppercase' as const },
  editorialLg:{ fontFamily: font.serif, fontSize: 28,  lineHeight: 1.1,  fontStyle: 'italic' as const },
  editorial:  { fontFamily: font.serif, fontSize: 19,  lineHeight: 1.45, fontStyle: 'italic' as const },
  body:       { fontFamily: font.sans, fontSize: 14,  lineHeight: 1.5  },
  bodyLg:     { fontFamily: font.sans, fontSize: 16,  lineHeight: 1.5  },
  bodySm:     { fontFamily: font.sans, fontSize: 12,  lineHeight: 1.4  },
  eyebrow:    { fontFamily: font.mono, fontSize: 10,  letterSpacing: 1.8, textTransform: 'uppercase' as const, fontWeight: 600 },
  meta:       { fontFamily: font.mono, fontSize: 11,  letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' as const },
} as const;

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 56, 10: 72 } as const;
export const radius = { none: 0, sm: 2, md: 6, lg: 12, pill: 999 } as const;
export const shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
} as const;

// Color swatches for the 10-level hair color scale (L1=jet black → L10=platinum)
export const levelSwatches: Record<string, string> = {
  L1: '#1a120c', L2: '#2a1c10', L3: '#3d2a1e', L4: '#5a3e2a',
  L5: '#7a5638', L6: '#9b7547', L7: '#b89461', L8: '#d1b283',
  L9: '#e2ce9e', L10:'#ead9af',
};

// Tag/category → background + text color
export const tagPalette = {
  vip:     { bg: '#e8573c', fg: '#ffffff' },
  new:     { bg: '#f4c752', fg: '#111111' },
  regular: { bg: '#f6efe4', fg: '#111111' },
  consult: { bg: '#7a8f6b', fg: '#ffffff' },
} as const;

// Note/toast tone → background + accent border color
export const notePalette = {
  info:    { bg: '#f6efe4', accent: '#6b3a4a' },
  success: { bg: '#eaf0e3', accent: '#7a8f6b' },
  warn:    { bg: '#fbefcf', accent: '#c48a34' },
  danger:  { bg: '#fce4dd', accent: '#e8573c' },
} as const;