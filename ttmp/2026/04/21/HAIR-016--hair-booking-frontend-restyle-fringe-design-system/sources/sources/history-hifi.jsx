// Fringe — Hair History hi-fi. Three editorial directions.
// V1 Luxe Editorial · V2 Modern Minimal · V3 Magazine / Print

const FRINGE_DATA = {
  lastService: 'Partial highlights',
  lastWhen: '3 months ago',
  allergies: 'None',
  conditions: [
    { label: 'Breakage',    v: 2 },
    { label: 'Split ends',  v: 3 },
    { label: 'Dryness',     v: 1 },
    { label: 'Oily scalp',  v: 1 },
    { label: 'Frizz',       v: 3 },
  ],
  chips: ['Healthy', 'Dry', 'Damaged', 'Brittle', 'Oily', 'Frizzy', 'Fine', 'Thick', 'Color-treated'],
  chipsSelected: ['Healthy', 'Frizzy'],
  notes: "Usually wash twice a week. Ends feel crunchy in winter. Dream outcome: lived-in blonde that doesn't need tons of toning.",
};

function FringeStatusBar({ color = '#000' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px 8px', fontSize: 13, fontWeight: 600, color,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={color}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
          <rect x="0.5" y="0.5" width="13" height="10" rx="2" fill="none" stroke={color} strokeOpacity="0.4"/>
          <rect x="2" y="2" width="10" height="7" rx="1"/>
        </svg>
      </div>
    </div>
  );
}

function FringeHome({ color = '#000' }) {
  return (
    <div style={{
      position: 'absolute', bottom: 6, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50,
    }}>
      <div style={{ width: 120, height: 4, borderRadius: 2, background: color, opacity: 0.65 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V1 — LUXE EDITORIAL
// Cream + taupe, Instrument Serif, italic accents, generous whitespace
// ─────────────────────────────────────────────────────────────
function History_Luxe() {
  const C = {
    paper: '#f4efe6',
    ink: '#2a2520',
    soft: '#8a7f70',
    rule: '#d5ccbb',
    accent: '#6b4a30',
  };
  const serif = '"Instrument Serif", "Cormorant Garamond", Georgia, serif';
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  const block = '"Anton", "Oswald", Impact, sans-serif';

  return (
    <div style={{ height: '100%', background: C.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 26px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
          </button>
          <div style={{ fontFamily: block, fontSize: 13, color: C.ink, letterSpacing: 3, textTransform: 'uppercase' }}>
            Fringe
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
            05 / 06
          </div>
        </div>

        <div style={{
          fontFamily: block, fontSize: 11, color: C.accent,
          letterSpacing: 2.5, textTransform: 'uppercase',
          marginTop: 28, fontWeight: 400,
        }}>
          Chapter V — The Record
        </div>
        <div style={{
          fontFamily: serif, fontSize: 56, fontWeight: 400,
          color: C.ink, margin: '10px 0 0', lineHeight: 0.95,
          letterSpacing: -0.8,
        }}>
          Your hair,<br/><em style={{ fontStyle: 'italic', color: C.accent }}>in confidence.</em>
        </div>
        <div style={{
          fontFamily: sans, fontSize: 13, color: C.soft, marginTop: 18,
          lineHeight: 1.5, maxWidth: 280, fontWeight: 400,
        }}>
          Five quiet questions so we can cut, color and care for it right. All optional, always private.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 26px 120px' }}>

        {/* Q1 */}
        <div style={{ borderTop: `1px solid ${C.rule}`, padding: '22px 0', display: 'flex', gap: 16, cursor: 'pointer' }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, width: 18, paddingTop: 6 }}>i</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Last chemical service
            </div>
            <div style={{ fontFamily: serif, fontSize: 28, color: C.ink, lineHeight: 1.05, letterSpacing: -0.3 }}>
              {FRINGE_DATA.lastService}
              <span style={{ fontStyle: 'italic', color: C.soft, fontSize: 20 }}> — {FRINGE_DATA.lastWhen}</span>
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.soft} strokeWidth="1" style={{ marginTop: 12 }}><path d="M4 3l4 3-4 3"/></svg>
        </div>

        {/* Q2 chips */}
        <div style={{ borderTop: `1px solid ${C.rule}`, padding: '22px 0', display: 'flex', gap: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, width: 18, paddingTop: 6 }}>ii</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              Current condition
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FRINGE_DATA.chips.map(chip => {
                const sel = FRINGE_DATA.chipsSelected.includes(chip);
                return (
                  <span key={chip} style={{
                    fontFamily: serif, fontSize: 16,
                    padding: '5px 14px 4px',
                    border: `1px solid ${sel ? C.ink : C.rule}`,
                    background: sel ? C.ink : 'transparent',
                    color: sel ? C.paper : C.ink,
                    borderRadius: 20,
                    fontStyle: sel ? 'italic' : 'normal',
                  }}>{chip}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q3 condition ratings */}
        <div style={{ borderTop: `1px solid ${C.rule}`, padding: '22px 0', display: 'flex', gap: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, width: 18, paddingTop: 6 }}>iii</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
              Rate each — 1 poor, 5 great
            </div>
            {FRINGE_DATA.conditions.map(({ label, v }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
                <div style={{ fontFamily: serif, fontSize: 17, color: C.ink, width: 110, letterSpacing: -0.2 }}>{label}</div>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 2,
                      background: n <= v ? C.ink : C.rule,
                    }}/>
                  ))}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, width: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}/5</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q4 notes */}
        <div style={{ borderTop: `1px solid ${C.rule}`, padding: '22px 0', display: 'flex', gap: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, width: 18, paddingTop: 6 }}>iv</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Anything else
            </div>
            <div style={{
              fontFamily: serif, fontSize: 17, lineHeight: 1.45, color: C.ink,
              fontStyle: 'italic', minHeight: 80, paddingRight: 8,
            }}>
              "{FRINGE_DATA.notes}"
            </div>
          </div>
        </div>

        {/* Q5 two-up */}
        <div style={{ borderTop: `1px solid ${C.rule}`, padding: '22px 0', display: 'flex', gap: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, width: 18, paddingTop: 6 }}>v</div>
          <div style={{ flex: 1, display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Allergies</div>
              <div style={{ fontFamily: serif, fontSize: 22, color: C.ink, lineHeight: 1 }}>{FRINGE_DATA.allergies}</div>
            </div>
            <div style={{ width: 1, background: C.rule }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Pregnancy</div>
              <div style={{ fontFamily: serif, fontSize: 22, color: C.ink, lineHeight: 1 }}>No</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 26px 28px', background: C.paper, zIndex: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button style={{
          fontFamily: serif, fontSize: 16, fontStyle: 'italic',
          background: 'transparent', border: 'none', color: C.soft, cursor: 'pointer',
          padding: 0,
        }}>
          skip
        </button>
        <button style={{
          flex: 1, padding: '14px 22px',
          background: C.ink, color: C.paper, border: 'none',
          fontFamily: serif, fontSize: 18, letterSpacing: 0.3,
          cursor: 'pointer', borderRadius: 2,
        }}>
          Continue
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V2 — MODERN MINIMAL
// All-white, crisp sans, micro-type, tight grid, thin rules
// ─────────────────────────────────────────────────────────────
function History_Minimal() {
  const C = {
    bg: '#ffffff',
    ink: '#0f0f0f',
    soft: '#9a9a9a',
    rule: '#ececec',
    chipBg: '#f5f5f5',
    accent: '#0f0f0f',
  };
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  const block = '"Anton", "Oswald", Impact, sans-serif';

  return (
    <div style={{ height: '100%', background: C.bg, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
          </button>
          <div style={{ fontFamily: block, fontSize: 13, color: C.ink, letterSpacing: 3, textTransform: 'uppercase' }}>
            Fringe
          </div>
          <div style={{
            fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5,
            fontVariantNumeric: 'tabular-nums',
          }}>
            05 / 06
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 2, background: C.rule, marginTop: 20, borderRadius: 1 }}>
          <div style={{ width: '83%', height: 2, background: C.ink, borderRadius: 1 }}/>
        </div>

        <div style={{
          fontFamily: block, fontSize: 11, color: C.ink,
          letterSpacing: 2.5, textTransform: 'uppercase',
          marginTop: 24, fontWeight: 400, opacity: 0.55,
        }}>
          Step 05
        </div>
        <div style={{
          fontFamily: sans, fontSize: 28, fontWeight: 600,
          color: C.ink, margin: '6px 0 6px', lineHeight: 1.1,
          letterSpacing: -0.8,
        }}>
          Hair history
        </div>
        <div style={{
          fontFamily: sans, fontSize: 14, color: C.soft, fontWeight: 400,
          lineHeight: 1.4, maxWidth: 300,
        }}>
          A few questions so we can tailor the visit. All optional.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 22px 110px' }}>

        {/* Q1 */}
        <div style={{ padding: '16px 0', borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, letterSpacing: 0.2, marginBottom: 4 }}>
              Last chemical service
            </div>
            <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: C.ink }}>
              {FRINGE_DATA.lastService} <span style={{ color: C.soft, fontWeight: 400 }}>· {FRINGE_DATA.lastWhen}</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.soft} strokeWidth="1.3"><path d="M5 3l4 4-4 4"/></svg>
        </div>

        {/* Q2 chips */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, marginBottom: 12 }}>
            Current condition
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FRINGE_DATA.chips.map(chip => {
              const sel = FRINGE_DATA.chipsSelected.includes(chip);
              return (
                <span key={chip} style={{
                  fontFamily: sans, fontSize: 13, fontWeight: 500,
                  padding: '7px 12px',
                  background: sel ? C.ink : C.chipBg,
                  color: sel ? C.bg : C.ink,
                  borderRadius: 100,
                  letterSpacing: -0.1,
                }}>{chip}</span>
              );
            })}
          </div>
        </div>

        {/* Q3 condition */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, marginBottom: 14 }}>
            Rate — 1 low, 5 high
          </div>
          {FRINGE_DATA.conditions.map(({ label, v }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.ink, width: 100 }}>{label}</div>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{
                    flex: 1, height: 6,
                    background: n <= v ? C.ink : C.rule,
                    borderRadius: 3,
                  }}/>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, width: 18, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Q4 notes */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, marginBottom: 10 }}>
            Anything else
          </div>
          <div style={{
            fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.5,
            minHeight: 80,
          }}>
            {FRINGE_DATA.notes}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, marginTop: 6, textAlign: 'right' }}>
            147 / 500
          </div>
        </div>

        {/* Q5 two-up */}
        <div style={{ padding: '18px 0', display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, marginBottom: 4 }}>Allergies</div>
            <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: C.ink }}>{FRINGE_DATA.allergies}</div>
          </div>
          <div style={{ width: 1, background: C.rule }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: C.soft, marginBottom: 4 }}>Pregnancy</div>
            <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: C.ink }}>No</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 26px', background: C.bg, zIndex: 10, borderTop: `1px solid ${C.rule}` }}>
        <button style={{
          width: '100%', padding: '14px 22px',
          background: C.ink, color: C.bg, border: 'none',
          fontFamily: sans, fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
          cursor: 'pointer', borderRadius: 12,
        }}>
          Continue
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V3 — MAGAZINE / PRINT
// Didone display, big numerals, rule lines, asymmetric grid, mono captions
// ─────────────────────────────────────────────────────────────
function History_Magazine() {
  const C = {
    paper: '#fbfaf7',
    ink: '#0a0a0a',
    soft: '#8b8a85',
    rule: '#0a0a0a',
    faint: '#e2e0da',
  };
  const didone = '"Playfair Display", "Bodoni Moda", "Didot", Georgia, serif';
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  const block = '"Anton", "Oswald", Impact, sans-serif';

  return (
    <div style={{ height: '100%', background: C.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
          </button>
          <div style={{ fontFamily: block, fontSize: 16, color: C.ink, letterSpacing: 4, textTransform: 'uppercase' }}>
            Fringe
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>
            pg. 05
          </div>
        </div>

        <div style={{ borderTop: `2px solid ${C.ink}`, borderBottom: `0.5px solid ${C.ink}`, height: 4, marginTop: 16 }}/>

        {/* Asymmetric masthead */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 26 }}>
          <div style={{
            fontFamily: block, fontSize: 128, lineHeight: 0.78, fontWeight: 400,
            color: C.ink, letterSpacing: -2,
          }}>
            5
          </div>
          <div style={{ flex: 1, paddingBottom: 10 }}>
            <div style={{
              fontFamily: didone, fontSize: 28, fontWeight: 400,
              color: C.ink, lineHeight: 1, letterSpacing: -0.5,
              fontStyle: 'italic',
            }}>
              The<br/>History
            </div>
          </div>
        </div>

        <div style={{ borderTop: `0.5px solid ${C.ink}`, marginTop: 14, paddingTop: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.ink, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            A brief on what your hair has been through
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 110px' }}>

        {/* Q1 — big display */}
        <div style={{ padding: '18px 0', borderTop: `0.5px solid ${C.ink}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: didone, fontSize: 34, fontStyle: 'italic', color: C.ink, width: 36, lineHeight: 1 }}>i.</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Last service
            </div>
            <div style={{ fontFamily: didone, fontSize: 26, color: C.ink, lineHeight: 1.1, letterSpacing: -0.3 }}>
              {FRINGE_DATA.lastService},
            </div>
            <div style={{ fontFamily: didone, fontSize: 18, fontStyle: 'italic', color: C.soft, marginTop: 2 }}>
              {FRINGE_DATA.lastWhen}.
            </div>
          </div>
        </div>

        {/* Q2 chips */}
        <div style={{ padding: '18px 0', borderTop: `0.5px solid ${C.ink}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: didone, fontSize: 34, fontStyle: 'italic', color: C.ink, width: 36, lineHeight: 1 }}>ii.</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Condition
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FRINGE_DATA.chips.map(chip => {
                const sel = FRINGE_DATA.chipsSelected.includes(chip);
                return (
                  <span key={chip} style={{
                    fontFamily: didone, fontSize: 16,
                    padding: '3px 12px 2px',
                    border: `0.5px solid ${C.ink}`,
                    background: sel ? C.ink : 'transparent',
                    color: sel ? C.paper : C.ink,
                    fontStyle: sel ? 'italic' : 'normal',
                  }}>{chip}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q3 condition */}
        <div style={{ padding: '18px 0', borderTop: `0.5px solid ${C.ink}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: didone, fontSize: 34, fontStyle: 'italic', color: C.ink, width: 36, lineHeight: 1 }}>iii.</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              Condition ratings · 1 poor — 5 great
            </div>
            {FRINGE_DATA.conditions.map(({ label, v }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '6px 0', borderBottom: i < 4 ? `0.5px dotted ${C.rule}` : 'none' }}>
                <div style={{ fontFamily: didone, fontSize: 17, color: C.ink, flex: 1, letterSpacing: -0.2 }}>{label}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      width: 14, height: 14,
                      background: n <= v ? C.ink : 'transparent',
                      border: `0.5px solid ${C.ink}`,
                    }}/>
                  ))}
                </div>
                <div style={{ fontFamily: didone, fontSize: 18, fontStyle: 'italic', color: C.ink, width: 30, textAlign: 'right' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q4 notes */}
        <div style={{ padding: '18px 0', borderTop: `0.5px solid ${C.ink}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: didone, fontSize: 34, fontStyle: 'italic', color: C.ink, width: 36, lineHeight: 1 }}>iv.</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Further reading
            </div>
            <div style={{
              fontFamily: didone, fontSize: 17, lineHeight: 1.4, color: C.ink,
              minHeight: 80, fontStyle: 'italic',
            }}>
              &ldquo;{FRINGE_DATA.notes}&rdquo;
            </div>
          </div>
        </div>

        {/* Q5 two-up */}
        <div style={{ padding: '18px 0 0', borderTop: `0.5px solid ${C.ink}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: didone, fontSize: 34, fontStyle: 'italic', color: C.ink, width: 36, lineHeight: 1 }}>v.</div>
          <div style={{ flex: 1, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Allergies</div>
              <div style={{ fontFamily: didone, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>{FRINGE_DATA.allergies}</div>
            </div>
            <div style={{ width: 0.5, background: C.ink }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Pregnancy</div>
              <div style={{ fontFamily: didone, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>No</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 26px', background: C.paper, zIndex: 10, borderTop: `2px solid ${C.ink}`, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Cont. →
        </div>
        <button style={{
          flex: 1, padding: '13px 20px',
          background: C.ink, color: C.paper, border: 'none',
          fontFamily: didone, fontSize: 18, fontStyle: 'italic',
          cursor: 'pointer',
        }}>
          Turn the page
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V4 — EDITORIAL ZINE (refined)
// Keeps the black masthead + block display, drops tape/halftone.
// Coral accent. Calmer grid. Serif body.
// ─────────────────────────────────────────────────────────────
function History_EditorialZine() {
  const C = {
    paper: '#faf7f0',
    ink: '#0d0d0d',
    soft: '#8a857a',
    rule: '#0d0d0d',
    coral: '#e8573c',
    butter: '#f4c752',
  };
  const block = '"Anton", "Oswald", Impact, sans-serif';
  const serif = '"Instrument Serif", Georgia, serif';
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';

  return (
    <div style={{ height: '100%', background: C.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 11, color: C.ink, fontWeight: 600, letterSpacing: 1.5, padding: 0 }}>← BACK</button>
          <div style={{ fontFamily: block, fontSize: 14, color: C.ink, letterSpacing: 3.5, textTransform: 'uppercase' }}>Fringe</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>05 / 06</div>
        </div>

        {/* Masthead — clean black block, no tape */}
        <div style={{
          background: C.ink, color: C.paper,
          padding: '26px 22px 22px', marginTop: 16,
          position: 'relative',
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.butter, letterSpacing: 2, marginBottom: 10 }}>
            CHAPTER V — THE RECORD
          </div>
          <div style={{
            fontFamily: block, fontSize: 58, lineHeight: 0.88,
            letterSpacing: -0.5, textTransform: 'uppercase',
          }}>
            Your hair,<br/>
            <span style={{ color: C.coral }}>on the record.</span>
          </div>
        </div>

        <div style={{ fontFamily: serif, fontSize: 15, fontStyle: 'italic', color: C.soft, marginTop: 14, lineHeight: 1.4 }}>
          Five questions so we can cut, color and care for it right.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 110px' }}>

        {/* Q1 */}
        <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: block, fontSize: 13, color: C.coral, letterSpacing: 2, width: 24, paddingTop: 4 }}>01</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Last chemical service
            </div>
            <div style={{ fontFamily: block, fontSize: 26, color: C.ink, textTransform: 'uppercase', lineHeight: 1, letterSpacing: 0.3 }}>
              {FRINGE_DATA.lastService}
            </div>
            <div style={{ fontFamily: serif, fontSize: 17, fontStyle: 'italic', color: C.coral, marginTop: 4 }}>
              {FRINGE_DATA.lastWhen}
            </div>
          </div>
        </div>

        {/* Q2 chips */}
        <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: block, fontSize: 13, color: C.coral, letterSpacing: 2, width: 24, paddingTop: 4 }}>02</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Current condition
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FRINGE_DATA.chips.map(chip => {
                const sel = FRINGE_DATA.chipsSelected.includes(chip);
                return (
                  <span key={chip} style={{
                    fontFamily: block, fontSize: 13, textTransform: 'uppercase',
                    padding: '5px 11px 3px', letterSpacing: 1,
                    border: `1px solid ${C.ink}`,
                    background: sel ? C.ink : 'transparent',
                    color: sel ? C.butter : C.ink,
                  }}>{chip}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q3 condition — bars with coral accent */}
        <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: block, fontSize: 13, color: C.coral, letterSpacing: 2, width: 24, paddingTop: 4 }}>03</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              Condition · 1 poor — 5 great
            </div>
            {FRINGE_DATA.conditions.map(({ label, v }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ fontFamily: block, fontSize: 14, color: C.ink, textTransform: 'uppercase', width: 100, letterSpacing: 0.5 }}>{label}</div>
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 8,
                      background: n <= v ? (v <= 2 ? C.coral : C.ink) : 'transparent',
                      border: `1px solid ${C.ink}`,
                    }}/>
                  ))}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, width: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}/5</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q4 */}
        <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: block, fontSize: 13, color: C.coral, letterSpacing: 2, width: 24, paddingTop: 4 }}>04</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Anything else
            </div>
            <div style={{
              fontFamily: serif, fontSize: 17, lineHeight: 1.45, color: C.ink,
              fontStyle: 'italic', minHeight: 80,
              borderLeft: `2px solid ${C.coral}`, paddingLeft: 14,
            }}>
              "{FRINGE_DATA.notes}"
            </div>
          </div>
        </div>

        {/* Q5 */}
        <div style={{ padding: '16px 0 0', borderTop: `0.5px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{ fontFamily: block, fontSize: 13, color: C.coral, letterSpacing: 2, width: 24, paddingTop: 4 }}>05</div>
          <div style={{ flex: 1, display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Allergies</div>
              <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>{FRINGE_DATA.allergies}</div>
            </div>
            <div style={{ width: 0.5, background: C.ink }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Pregnancy</div>
              <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>No</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 28px', background: C.paper, zIndex: 10, borderTop: `0.5px solid ${C.ink}` }}>
        <button style={{
          width: '100%', padding: '15px 20px',
          background: C.ink, color: C.paper, border: 'none',
          fontFamily: block, fontSize: 20, letterSpacing: 2,
          textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Keep Going <span style={{ color: C.coral }}>→</span>
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V5 — QUIET ZINE
// Ivory + ochre + sage. Bold block display but softer.
// No tape, no highlighter — color blocks and generous whitespace.
// ─────────────────────────────────────────────────────────────
function History_QuietZine() {
  const C = {
    paper: '#f6f3ea',
    ink: '#1c1a16',
    soft: '#8f8a7e',
    rule: '#d8d2c2',
    ochre: '#c48a34',
    sage: '#7a8f6b',
    blush: '#e6b8a8',
  };
  const block = '"Anton", "Oswald", Impact, sans-serif';
  const serif = '"Instrument Serif", Georgia, serif';
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';

  return (
    <div style={{ height: '100%', background: C.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
          </button>
          <div style={{ fontFamily: block, fontSize: 14, color: C.ink, letterSpacing: 3.5, textTransform: 'uppercase' }}>Fringe</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>05 / 06</div>
        </div>

        {/* Progress: thin bar w/ ochre fill */}
        <div style={{ height: 3, background: C.rule, marginTop: 18 }}>
          <div style={{ width: '83%', height: 3, background: C.ochre }}/>
        </div>

        {/* Eyebrow w/ sage square */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 26 }}>
          <div style={{ width: 10, height: 10, background: C.sage }}/>
          <div style={{ fontFamily: block, fontSize: 12, color: C.ink, letterSpacing: 2.5, textTransform: 'uppercase' }}>
            Chapter 05 · The Record
          </div>
        </div>

        <div style={{
          fontFamily: block, fontSize: 56, lineHeight: 0.9,
          letterSpacing: -0.5, textTransform: 'uppercase',
          color: C.ink, marginTop: 14,
        }}>
          The<br/>story so<br/><span style={{ color: C.ochre }}>far.</span>
        </div>
        <div style={{ fontFamily: serif, fontSize: 16, fontStyle: 'italic', color: C.soft, marginTop: 14, lineHeight: 1.4, maxWidth: 290 }}>
          Five gentle questions. Skip anything you'd rather not answer.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 22px 110px' }}>

        {/* Q1 — ochre index chip */}
        <div style={{ padding: '18px 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{
            fontFamily: block, fontSize: 13, color: C.paper,
            background: C.ochre, letterSpacing: 1.5,
            padding: '3px 7px 2px', height: 20, alignSelf: 'flex-start',
          }}>01</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Last chemical service
            </div>
            <div style={{ fontFamily: block, fontSize: 26, color: C.ink, textTransform: 'uppercase', lineHeight: 1, letterSpacing: 0.3 }}>
              {FRINGE_DATA.lastService}
            </div>
            <div style={{ fontFamily: serif, fontSize: 16, fontStyle: 'italic', color: C.ochre, marginTop: 4 }}>
              {FRINGE_DATA.lastWhen}
            </div>
          </div>
        </div>

        {/* Q2 chips — sage accent for selected */}
        <div style={{ padding: '18px 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{
            fontFamily: block, fontSize: 13, color: C.paper,
            background: C.sage, letterSpacing: 1.5,
            padding: '3px 7px 2px', height: 20, alignSelf: 'flex-start',
          }}>02</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Current condition
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FRINGE_DATA.chips.map(chip => {
                const sel = FRINGE_DATA.chipsSelected.includes(chip);
                return (
                  <span key={chip} style={{
                    fontFamily: block, fontSize: 13, textTransform: 'uppercase',
                    padding: '5px 12px 3px', letterSpacing: 1,
                    border: `1px solid ${sel ? C.sage : C.rule}`,
                    background: sel ? C.sage : 'transparent',
                    color: sel ? C.paper : C.ink,
                  }}>{chip}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q3 condition */}
        <div style={{ padding: '18px 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{
            fontFamily: block, fontSize: 13, color: C.paper,
            background: C.blush, letterSpacing: 1.5,
            padding: '3px 7px 2px', height: 20, alignSelf: 'flex-start', color: C.ink,
          }}>03</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              Condition · 1 poor — 5 great
            </div>
            {FRINGE_DATA.conditions.map(({ label, v }) => {
              const fillColor = v <= 2 ? C.blush : v <= 3 ? C.ochre : C.sage;
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <div style={{ fontFamily: block, fontSize: 14, color: C.ink, textTransform: 'uppercase', width: 100, letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 6,
                        background: n <= v ? fillColor : C.rule,
                      }}/>
                    ))}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, width: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Q4 */}
        <div style={{ padding: '18px 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{
            fontFamily: block, fontSize: 13, color: C.paper,
            background: C.ink, letterSpacing: 1.5,
            padding: '3px 7px 2px', height: 20, alignSelf: 'flex-start',
          }}>04</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Anything else
            </div>
            <div style={{
              fontFamily: serif, fontSize: 17, lineHeight: 1.45, color: C.ink,
              fontStyle: 'italic', minHeight: 80,
            }}>
              "{FRINGE_DATA.notes}"
            </div>
          </div>
        </div>

        {/* Q5 */}
        <div style={{ padding: '18px 0 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 14 }}>
          <div style={{
            fontFamily: block, fontSize: 13, color: C.ink,
            background: C.ochre, letterSpacing: 1.5,
            padding: '3px 7px 2px', height: 20, alignSelf: 'flex-start',
          }}>05</div>
          <div style={{ flex: 1, display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Allergies</div>
              <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>{FRINGE_DATA.allergies}</div>
            </div>
            <div style={{ width: 1, background: C.rule }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Pregnancy</div>
              <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>No</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 28px', background: C.paper, zIndex: 10, borderTop: `1px solid ${C.rule}` }}>
        <button style={{
          width: '100%', padding: '15px 20px',
          background: C.ink, color: C.paper, border: 'none',
          fontFamily: block, fontSize: 20, letterSpacing: 2,
          textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Keep Going <span style={{ color: C.ochre }}>→</span>
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V6 — MODERN ZINE
// White paper, plum + peach accents. Zine structure, gallery refinement.
// Block display contained in a colored panel, rest is white space.
// ─────────────────────────────────────────────────────────────
function History_ModernZine() {
  const C = {
    paper: '#ffffff',
    ink: '#111111',
    soft: '#9a958e',
    rule: '#ebe7df',
    plum: '#6b3a4a',
    peach: '#f2b89a',
    cream: '#f6efe4',
  };
  const block = '"Anton", "Oswald", Impact, sans-serif';
  const serif = '"Instrument Serif", Georgia, serif';
  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';

  return (
    <div style={{ height: '100%', background: C.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FringeStatusBar color={C.ink}/>

      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
          </button>
          <div style={{ fontFamily: block, fontSize: 14, color: C.ink, letterSpacing: 3.5, textTransform: 'uppercase' }}>Fringe</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>05 / 06</div>
        </div>
      </div>

      {/* Peach panel masthead, full bleed */}
      <div style={{
        background: C.peach, margin: '16px 22px 0', padding: '20px 20px 22px', position: 'relative',
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>
          CHAPTER V · THE RECORD
        </div>
        <div style={{
          fontFamily: block, fontSize: 54, lineHeight: 0.88,
          letterSpacing: -0.5, textTransform: 'uppercase', color: C.plum,
        }}>
          Your hair,<br/>
          <span style={{ color: C.ink }}>on file.</span>
        </div>
        <div style={{
          position: 'absolute', top: 14, right: 14,
          fontFamily: mono, fontSize: 10, color: C.plum,
          border: `1px solid ${C.plum}`, padding: '2px 6px', letterSpacing: 1.5, fontWeight: 600,
        }}>05/06</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 110px' }}>

        <div style={{ fontFamily: serif, fontSize: 15, fontStyle: 'italic', color: C.soft, marginBottom: 20, lineHeight: 1.4 }}>
          Five questions so we can cut, color and care for it right.
        </div>

        {/* Q1 — peach card */}
        <div style={{
          background: C.cream, padding: '16px 18px', marginBottom: 10,
          borderLeft: `3px solid ${C.plum}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600 }}>
              01 — LAST SERVICE
            </div>
            <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft }}>edit</div>
          </div>
          <div style={{ fontFamily: block, fontSize: 26, color: C.ink, textTransform: 'uppercase', lineHeight: 1, letterSpacing: 0.3 }}>
            {FRINGE_DATA.lastService}
          </div>
          <div style={{ fontFamily: serif, fontSize: 16, fontStyle: 'italic', color: C.plum, marginTop: 4 }}>
            {FRINGE_DATA.lastWhen}
          </div>
        </div>

        {/* Q2 chips */}
        <div style={{ padding: '14px 0 18px' }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>
            02 — CURRENT CONDITION
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FRINGE_DATA.chips.map(chip => {
              const sel = FRINGE_DATA.chipsSelected.includes(chip);
              return (
                <span key={chip} style={{
                  fontFamily: block, fontSize: 13, textTransform: 'uppercase',
                  padding: '6px 12px 4px', letterSpacing: 1,
                  border: `1px solid ${sel ? C.plum : C.rule}`,
                  background: sel ? C.plum : 'transparent',
                  color: sel ? C.paper : C.ink,
                  borderRadius: 100,
                }}>{chip}</span>
              );
            })}
          </div>
        </div>

        {/* Q3 */}
        <div style={{ padding: '14px 0 18px', borderTop: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 14 }}>
            03 — CONDITION · 1 POOR, 5 GREAT
          </div>
          {FRINGE_DATA.conditions.map(({ label, v }) => {
            const fill = v <= 2 ? C.peach : v <= 3 ? C.plum : C.ink;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ fontFamily: block, fontSize: 14, color: C.ink, textTransform: 'uppercase', width: 100, letterSpacing: 0.5 }}>{label}</div>
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 8,
                      background: n <= v ? fill : C.rule,
                      borderRadius: 2,
                    }}/>
                  ))}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, width: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}/5</div>
              </div>
            );
          })}
        </div>

        {/* Q4 */}
        <div style={{ padding: '14px 0 18px', borderTop: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>
            04 — ANYTHING ELSE
          </div>
          <div style={{
            fontFamily: serif, fontSize: 17, lineHeight: 1.45, color: C.ink,
            fontStyle: 'italic', minHeight: 80,
            background: C.cream, padding: '14px 16px',
          }}>
            "{FRINGE_DATA.notes}"
          </div>
        </div>

        {/* Q5 */}
        <div style={{ padding: '14px 0 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>05A — ALLERGIES</div>
            <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>{FRINGE_DATA.allergies}</div>
          </div>
          <div style={{ width: 1, background: C.rule }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>05B — PREGNANCY</div>
            <div style={{ fontFamily: block, fontSize: 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>No</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 28px', background: C.paper, zIndex: 10, borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 10 }}>
        <button style={{
          padding: '14px 18px',
          background: 'transparent', border: `1px solid ${C.ink}`,
          fontFamily: block, fontSize: 15, letterSpacing: 1.5,
          textTransform: 'uppercase', color: C.ink, cursor: 'pointer',
        }}>
          Skip
        </button>
        <button style={{
          flex: 1, padding: '14px 20px',
          background: C.plum, color: C.paper, border: 'none',
          fontFamily: block, fontSize: 19, letterSpacing: 2,
          textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Keep Going <span style={{ color: C.peach }}>→</span>
        </button>
      </div>
      <FringeHome color={C.ink}/>
    </div>
  );
}

Object.assign(window, {
  History_Luxe, History_Minimal, History_Magazine,
  History_EditorialZine, History_QuietZine, History_ModernZine,
});
