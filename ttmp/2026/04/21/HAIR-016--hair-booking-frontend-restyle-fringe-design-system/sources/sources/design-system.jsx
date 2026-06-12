// ══════════════════════════════════════════════════════════════════
// FRINGE DESIGN SYSTEM
// Tokens + components. Export on window.FS.
// ══════════════════════════════════════════════════════════════════

const FS = {};

// ─── TOKENS ────────────────────────────────────────────────────────
FS.color = {
  // Neutrals
  ink:       '#111111',
  paper:     '#ffffff',
  cream:     '#f6efe4',
  creamDeep: '#efe6d4',
  rule:      '#ebe7df',
  soft:      '#9a958e',
  softInk:   '#5b5852',

  // Brand (plum + peach core, extended)
  plum:      '#6b3a4a',
  plumDeep:  '#4a2431',
  peach:     '#f2b89a',
  peachSoft: '#faddc9',

  // Expanded accents
  coral:     '#e8573c',
  butter:    '#f4c752',
  ochre:     '#c48a34',
  sage:      '#7a8f6b',
  blush:     '#e6b8a8',

  // Semantic
  success:   '#7a8f6b',
  warn:      '#c48a34',
  danger:    '#e8573c',
};

FS.font = {
  block: '"Anton", "Oswald", Impact, sans-serif',   // Display
  serif: '"Instrument Serif", Georgia, serif',       // Editorial / italic
  sans:  '"Inter", system-ui, sans-serif',           // Body / UI
  mono:  '"JetBrains Mono", ui-monospace, monospace',// Eyebrows / meta
};

FS.type = {
  // Display (block / Anton)
  display1: { fontFamily: FS.font.block, fontSize: 120, lineHeight: 0.85, letterSpacing: -2,   textTransform: 'uppercase' },
  display2: { fontFamily: FS.font.block, fontSize: 72,  lineHeight: 0.9,  letterSpacing: -1,   textTransform: 'uppercase' },
  display3: { fontFamily: FS.font.block, fontSize: 54,  lineHeight: 0.9,  letterSpacing: -0.5, textTransform: 'uppercase' },
  h1:       { fontFamily: FS.font.block, fontSize: 36,  lineHeight: 1,    letterSpacing: 0.3,  textTransform: 'uppercase' },
  h2:       { fontFamily: FS.font.block, fontSize: 26,  lineHeight: 1,    letterSpacing: 0.3,  textTransform: 'uppercase' },
  h3:       { fontFamily: FS.font.block, fontSize: 20,  lineHeight: 1.05, letterSpacing: 0.5,  textTransform: 'uppercase' },

  // Editorial
  editorial:    { fontFamily: FS.font.serif, fontSize: 19, lineHeight: 1.45, fontStyle: 'italic' },
  editorialLg:  { fontFamily: FS.font.serif, fontSize: 28, lineHeight: 1.1,  fontStyle: 'italic' },

  // Body
  body:     { fontFamily: FS.font.sans, fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
  bodyLg:   { fontFamily: FS.font.sans, fontSize: 16, lineHeight: 1.5, fontWeight: 400 },
  bodySm:   { fontFamily: FS.font.sans, fontSize: 12, lineHeight: 1.4, fontWeight: 400 },

  // Meta (mono eyebrows)
  eyebrow:  { fontFamily: FS.font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: 600 },
  meta:     { fontFamily: FS.font.mono, fontSize: 11, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' },
};

FS.space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:56, 10:72 };
FS.radius = { none: 0, sm: 2, md: 6, lg: 12, pill: 999 };
FS.shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
};

// ─── PRIMITIVES ────────────────────────────────────────────────────
FS.Eyebrow = ({ children, color, style }) => (
  <div style={{ ...FS.type.eyebrow, color: color || FS.color.plum, ...style }}>{children}</div>
);

FS.Wordmark = ({ size = 16, color = FS.color.ink }) => (
  <div style={{ fontFamily: FS.font.block, fontSize: size, color, letterSpacing: size * 0.25, textTransform: 'uppercase' }}>
    Fringe
  </div>
);

FS.Rule = ({ color = FS.color.rule, thick }) => (
  <div style={{ height: thick ? 2 : 1, background: color, width: '100%' }}/>
);

// ─── BUTTONS ───────────────────────────────────────────────────────
FS.Button = ({ variant = 'primary', size = 'md', children, style, ...rest }) => {
  const sizes = {
    sm: { padding: '10px 14px', fontSize: 13, letterSpacing: 1.2 },
    md: { padding: '14px 20px', fontSize: 16, letterSpacing: 1.8 },
    lg: { padding: '17px 26px', fontSize: 19, letterSpacing: 2.2 },
  };
  const variants = {
    primary:   { background: FS.color.plum, color: FS.color.paper, border: 'none' },
    secondary: { background: 'transparent', color: FS.color.ink, border: `1px solid ${FS.color.ink}` },
    ghost:     { background: 'transparent', color: FS.color.ink, border: 'none' },
    danger:    { background: FS.color.coral, color: FS.color.paper, border: 'none' },
  };
  return (
    <button {...rest} style={{
      fontFamily: FS.font.block, textTransform: 'uppercase', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      ...sizes[size], ...variants[variant], ...style,
    }}>
      {children}
    </button>
  );
};

// ─── CHIP (filter / tag / pill) ────────────────────────────────────
FS.Chip = ({ selected, onClick, children, shape = 'pill', style }) => (
  <span onClick={onClick} style={{
    fontFamily: FS.font.block, fontSize: 13, textTransform: 'uppercase',
    padding: '6px 12px 4px', letterSpacing: 1, cursor: onClick ? 'pointer' : 'default',
    border: `1px solid ${selected ? FS.color.plum : FS.color.rule}`,
    background: selected ? FS.color.plum : 'transparent',
    color: selected ? FS.color.paper : FS.color.ink,
    borderRadius: shape === 'pill' ? FS.radius.pill : 0,
    display: 'inline-block',
    ...style,
  }}>{children}</span>
);

// ─── INPUT ────────────────────────────────────────────────────────
FS.TextField = ({ label, value, placeholder, multiline, style }) => (
  <label style={{ display: 'block' }}>
    {label && <div style={{ ...FS.type.eyebrow, color: FS.color.plum, marginBottom: 8 }}>{label}</div>}
    {multiline ? (
      <textarea defaultValue={value} placeholder={placeholder} style={{
        width: '100%', minHeight: 90, padding: '12px 14px', background: FS.color.cream,
        border: 'none', fontFamily: FS.font.serif, fontSize: 17, fontStyle: 'italic',
        color: FS.color.ink, lineHeight: 1.45, resize: 'vertical', outline: 'none', ...style,
      }}/>
    ) : (
      <input defaultValue={value} placeholder={placeholder} style={{
        width: '100%', padding: '12px 14px', background: FS.color.cream,
        border: 'none', fontFamily: FS.font.sans, fontSize: 15, color: FS.color.ink,
        outline: 'none', ...style,
      }}/>
    )}
  </label>
);

// ─── CARD ─────────────────────────────────────────────────────────
FS.Card = ({ accent, children, style }) => (
  <div style={{
    background: FS.color.cream, padding: '16px 18px',
    borderLeft: accent ? `3px solid ${accent}` : 'none',
    ...style,
  }}>{children}</div>
);

// ─── RATING BAR (segmented 1–5) ────────────────────────────────────
FS.RatingBar = ({ value, max = 5, color, label }) => {
  const fill = color || (value <= 2 ? FS.color.peach : value <= 3 ? FS.color.plum : FS.color.ink);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      {label && <div style={{ ...FS.type.h3, fontSize: 14, color: FS.color.ink, width: 100, letterSpacing: 0.5 }}>{label}</div>}
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, background: i < value ? fill : FS.color.rule, borderRadius: FS.radius.sm }}/>
        ))}
      </div>
      <div style={{ ...FS.type.meta, color: FS.color.soft, width: 22, textAlign: 'right' }}>{value}/{max}</div>
    </div>
  );
};

// ─── SEGMENTED CONTROL ────────────────────────────────────────────
FS.Segmented = ({ options, value, onChange, style }) => (
  <div style={{ display: 'flex', border: `1px solid ${FS.color.ink}`, ...style }}>
    {options.map((o, i) => {
      const val = typeof o === 'string' ? o : o.value;
      const label = typeof o === 'string' ? o : o.label;
      const sel = val === value;
      return (
        <button key={val} onClick={() => onChange?.(val)} style={{
          flex: 1, padding: '10px 12px',
          fontFamily: FS.font.block, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
          background: sel ? FS.color.ink : 'transparent',
          color: sel ? FS.color.paper : FS.color.ink,
          border: 'none', borderLeft: i ? `1px solid ${FS.color.ink}` : 'none', cursor: 'pointer',
        }}>{label}</button>
      );
    })}
  </div>
);

// ─── PROGRESS BAR ─────────────────────────────────────────────────
FS.Progress = ({ value, max = 100, color = FS.color.plum }) => (
  <div style={{ height: 3, background: FS.color.rule, width: '100%' }}>
    <div style={{ height: 3, background: color, width: `${(value / max) * 100}%` }}/>
  </div>
);

// ─── STEPPER / LABEL INDEX ────────────────────────────────────────
FS.IndexChip = ({ n, bg = FS.color.plum, color = FS.color.paper }) => (
  <div style={{
    fontFamily: FS.font.block, fontSize: 13, letterSpacing: 1.5,
    padding: '3px 7px 2px', background: bg, color, display: 'inline-block',
  }}>{n}</div>
);

// ─── SECTION (numbered row used across screens) ───────────────────
FS.Section = ({ n, title, children, accent = FS.color.plum, topBorder = true }) => (
  <div style={{ padding: '18px 0', borderTop: topBorder ? `1px solid ${FS.color.rule}` : 'none', display: 'flex', gap: 14 }}>
    <div style={{ width: 32 }}>
      {n && <FS.IndexChip n={n} bg={accent}/>}
    </div>
    <div style={{ flex: 1 }}>
      {title && <FS.Eyebrow style={{ marginBottom: 10 }}>{title}</FS.Eyebrow>}
      {children}
    </div>
  </div>
);

// ─── MASTHEAD (peach panel with plum/ink headline) ────────────────
FS.Masthead = ({ eyebrow, title, accent, compact, right }) => (
  <div style={{
    background: FS.color.peach, padding: compact ? '18px 20px 20px' : '24px 24px 26px',
    position: 'relative',
  }}>
    {eyebrow && (
      <div style={{ ...FS.type.eyebrow, color: FS.color.plum, marginBottom: 10 }}>{eyebrow}</div>
    )}
    <div style={{
      ...FS.type.display3, fontSize: compact ? 48 : 56,
      color: FS.color.plum,
    }}>
      {title}
      {accent && <><br/><span style={{ color: FS.color.ink }}>{accent}</span></>}
    </div>
    {right && (
      <div style={{
        position: 'absolute', top: 14, right: 14,
        ...FS.type.eyebrow, color: FS.color.plum,
        border: `1px solid ${FS.color.plum}`, padding: '2px 6px',
      }}>{right}</div>
    )}
  </div>
);

// ─── APP HEADER (mobile) ──────────────────────────────────────────
FS.AppHeader = ({ step, total, onBack }) => (
  <div style={{ padding: '6px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={FS.color.ink} strokeWidth="1.5" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
    </button>
    <FS.Wordmark size={14}/>
    {step != null && (
      <div style={{ ...FS.type.meta, color: FS.color.soft }}>{String(step).padStart(2,'0')} / {String(total).padStart(2,'0')}</div>
    )}
  </div>
);

// ─── iOS STATUS BAR + HOME INDICATOR ──────────────────────────────
FS.StatusBar = ({ color = FS.color.ink }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 24px 8px', fontSize: 13, fontWeight: 600, color,
    fontFamily: '-apple-system, system-ui, sans-serif',
  }}>
    <span>9:41</span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <svg width="17" height="11" viewBox="0 0 17 11" fill={color}>
        <rect x="0" y="7" width="3" height="4"/><rect x="4.5" y="5" width="3" height="6"/>
        <rect x="9" y="2.5" width="3" height="8.5"/><rect x="13.5" y="0" width="3" height="11"/>
      </svg>
      <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
        <rect x="0.5" y="0.5" width="13" height="10" rx="2" fill="none" stroke={color} strokeOpacity="0.4"/>
        <rect x="2" y="2" width="10" height="7" rx="1"/>
      </svg>
    </div>
  </div>
);

FS.HomeIndicator = ({ color = FS.color.ink }) => (
  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}>
    <div style={{ width: 120, height: 4, borderRadius: 2, background: color, opacity: 0.65 }}/>
  </div>
);

FS.PhoneFrame = ({ children, w = 390, h = 844 }) => (
  <div style={{
    width: w, height: h, borderRadius: 48, overflow: 'hidden',
    border: '8px solid #1a1a1a', boxShadow: FS.shadow.lg, background: FS.color.paper,
    position: 'relative',
  }}>
    <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 110, height: 32, borderRadius: 20, background: '#000', zIndex: 100 }}/>
    {children}
  </div>
);

// ─── STYLIST CARD ─────────────────────────────────────────────────
FS.StylistCard = ({ name, role, rate, available, style }) => (
  <div style={{
    background: FS.color.paper, border: `1px solid ${FS.color.rule}`,
    padding: 16, display: 'flex', gap: 14, alignItems: 'center', ...style,
  }}>
    <div style={{ width: 56, height: 56, borderRadius: FS.radius.pill, background: FS.color.peachSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FS.font.block, fontSize: 22, color: FS.color.plum }}>
      {name.split(' ').map(w => w[0]).join('').slice(0,2)}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ ...FS.type.h3, fontSize: 18 }}>{name}</div>
      <div style={{ ...FS.type.bodySm, color: FS.color.soft, marginTop: 2 }}>{role}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      {rate && <div style={{ ...FS.type.meta, color: FS.color.plum }}>{rate}</div>}
      {available && <div style={{ ...FS.type.bodySm, fontStyle: 'italic', fontFamily: FS.font.serif, color: FS.color.sage }}>{available}</div>}
    </div>
  </div>
);

// ─── PHOTO TILE ───────────────────────────────────────────────────
FS.PhotoTile = ({ label, filled, style }) => (
  <div style={{
    aspectRatio: '1/1.2', background: filled ? FS.color.peachSoft : FS.color.cream,
    border: `1px dashed ${filled ? FS.color.plum : FS.color.soft}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...FS.type.eyebrow, color: filled ? FS.color.plum : FS.color.soft,
    ...style,
  }}>
    {filled ? '✓ ' + label : label}
  </div>
);

// ─── SUMMARY ROW (label + value) ──────────────────────────────────
FS.SummaryRow = ({ label, value, onEdit }) => (
  <div style={{ padding: '14px 0', borderTop: `1px solid ${FS.color.rule}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
    <div style={{ flex: 1 }}>
      <div style={{ ...FS.type.eyebrow, color: FS.color.soft, marginBottom: 4 }}>{label}</div>
      <div style={{ ...FS.type.h3, fontSize: 18, color: FS.color.ink }}>{value}</div>
    </div>
    {onEdit && <div onClick={onEdit} style={{ ...FS.type.editorial, fontSize: 14, color: FS.color.plum, cursor: 'pointer' }}>edit</div>}
  </div>
);

// ─── CALENDAR DAY CELL ────────────────────────────────────────────
FS.DayCell = ({ day, selected, disabled, onClick, dot }) => (
  <button onClick={onClick} disabled={disabled} style={{
    aspectRatio: '1/1', background: selected ? FS.color.plum : 'transparent',
    border: `1px solid ${selected ? FS.color.plum : FS.color.rule}`,
    color: selected ? FS.color.paper : disabled ? FS.color.soft : FS.color.ink,
    fontFamily: FS.font.block, fontSize: 16, cursor: disabled ? 'default' : 'pointer',
    position: 'relative', opacity: disabled ? 0.35 : 1,
  }}>
    {day}
    {dot && <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: selected ? FS.color.peach : FS.color.plum }}/>}
  </button>
);

// ─── TOAST / NOTE ─────────────────────────────────────────────────
FS.Note = ({ tone = 'info', children }) => {
  const bg = { info: FS.color.cream, success: '#eaf0e3', warn: '#fbefcf', danger: '#fce4dd' }[tone];
  const accent = { info: FS.color.plum, success: FS.color.sage, warn: FS.color.ochre, danger: FS.color.coral }[tone];
  return (
    <div style={{ background: bg, padding: '12px 14px', borderLeft: `3px solid ${accent}`, ...FS.type.body }}>
      {children}
    </div>
  );
};

window.FS = FS;
