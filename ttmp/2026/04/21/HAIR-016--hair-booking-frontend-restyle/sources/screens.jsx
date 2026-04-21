// Wireframe screens for hair intake. Low-fi sketchy style.
// Each screen accepts a `variant` prop (0,1,2) picking a different input pattern.

const SK = {
  ink: '#1a1a1a',
  faint: '#8a8680',
  line: '#2a2a2a',
  paper: '#fbf8f2',
  paperAlt: '#f3ede1',
  accent: '#c4634a',
  accentSoft: '#ecd5cb',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  hand: '"Caveat", "Patrick Hand", cursive',
  serif: '"Instrument Serif", Georgia, serif',
  sans: '"Inter", system-ui, sans-serif',
};

// ─── Primitives ──────────────────────────────────────
function SketchBox({ children, style, dashed, filled, thick, onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `${thick ? 2 : 1.5}px ${dashed ? 'dashed' : 'solid'} ${SK.line}`,
      borderRadius: 6,
      padding: 12,
      background: filled ? SK.paperAlt : 'transparent',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function SketchChip({ children, selected, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: `1.5px solid ${SK.line}`,
      borderRadius: 999,
      padding: '6px 12px',
      fontSize: 13, fontFamily: SK.sans,
      background: selected ? SK.ink : 'transparent',
      color: selected ? SK.paper : SK.ink,
      ...style,
    }}>{children}</span>
  );
}

function SketchRadio({ selected }) {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: 999,
      border: `1.5px solid ${SK.line}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {selected && <span style={{ width: 8, height: 8, borderRadius: 999, background: SK.ink }} />}
    </span>
  );
}

function SketchCheck({ selected }) {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: 3,
      border: `1.5px solid ${SK.line}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      background: selected ? SK.ink : 'transparent',
      color: SK.paper, fontSize: 11,
    }}>{selected && '✓'}</span>
  );
}

function Label({ children, style }) {
  return <div style={{
    fontSize: 11, fontFamily: SK.mono, textTransform: 'uppercase',
    letterSpacing: 0.5, color: SK.faint, marginBottom: 6, ...style
  }}>{children}</div>;
}

function QLabel({ children }) {
  return <div style={{
    fontSize: 15, fontFamily: SK.sans, fontWeight: 500,
    color: SK.ink, marginBottom: 10, marginTop: 20,
  }}>{children}</div>;
}

function Input({ placeholder, value }) {
  return (
    <div style={{
      border: `1.5px solid ${SK.line}`, borderRadius: 6,
      padding: '10px 12px', fontSize: 14, fontFamily: SK.sans,
      color: value ? SK.ink : SK.faint,
      minHeight: 20,
    }}>
      {value || placeholder}
    </div>
  );
}

function PrimaryBtn({ children, ghost, style }) {
  return (
    <div style={{
      border: `2px solid ${SK.ink}`,
      background: ghost ? 'transparent' : SK.ink,
      color: ghost ? SK.ink : SK.paper,
      padding: '12px 16px', borderRadius: 8,
      fontFamily: SK.sans, fontWeight: 600, fontSize: 15,
      textAlign: 'center',
      ...style,
    }}>{children}</div>
  );
}

function ScreenHeader({ step, total, title, sub }) {
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= step ? SK.ink : '#d9d4c8',
          }} />
        ))}
      </div>
      <Label>Step {step + 1} of {total}</Label>
      <div style={{
        fontSize: 24, fontFamily: SK.serif, color: SK.ink,
        lineHeight: 1.2, marginTop: 2, marginBottom: sub ? 6 : 0,
      }}>{title}</div>
      {sub && <div style={{
        fontSize: 13, color: SK.faint, fontFamily: SK.sans, lineHeight: 1.3,
      }}>{sub}</div>}
    </div>
  );
}

function BottomBar({ children }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '12px 20px 24px',
      background: SK.paper,
      borderTop: `1px solid ${SK.paperAlt}`,
    }}>{children}</div>
  );
}

function Annotation({ children, style }) {
  return (
    <div style={{
      fontFamily: SK.hand, fontSize: 15, color: SK.accent,
      lineHeight: 1.2, ...style,
    }}>{children}</div>
  );
}

// ─── Screen 1: Service Picker ──────────────────────────
function Screen_Service({ variant }) {
  // v0: list cards, v1: big icon tiles 2-col, v2: segmented toggle + combined card
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper }}>
      <div style={{ padding: '60px 20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontFamily: SK.mono, letterSpacing: 2, color: SK.accent }}>
          ✦ LUXE HAIR STUDIO ✦
        </div>
        <div style={{
          fontSize: 28, fontFamily: SK.serif, color: SK.ink,
          marginTop: 16, lineHeight: 1.15,
        }}>
          Ready for your<br/>hair transformation?
        </div>
        <div style={{ fontSize: 13, color: SK.faint, marginTop: 10, fontFamily: SK.sans }}>
          Tell us what you're looking for
        </div>
      </div>

      <div style={{ padding: '8px 20px' }}>
        {variant === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['I Want Color', 'Blonding, balayage, correction'],
              ['I Want Extensions', 'Tape-ins, k-tips, wefts'],
              ['Both Color + Extensions', 'The full transformation'],
            ].map(([t, s], i) => (
              <SketchBox key={i} filled={i === 0}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 6,
                    border: `1.5px dashed ${SK.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SK.mono, fontSize: 9, color: SK.faint,
                  }}>icn</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 14 }}>{t}</div>
                    <div style={{ fontSize: 12, color: SK.faint, marginTop: 2 }}>{s}</div>
                  </div>
                  <span style={{ color: SK.faint }}>›</span>
                </div>
              </SketchBox>
            ))}
          </div>
        )}

        {variant === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['Color', 'Extensions'].map((t, i) => (
                <SketchBox key={i} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '100%', aspectRatio: '1', maxHeight: 60,
                    border: `1.5px dashed ${SK.line}`, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SK.mono, fontSize: 9, color: SK.faint,
                  }}>img</div>
                  <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 15, marginTop: 8 }}>{t}</div>
                </SketchBox>
              ))}
            </div>
            <SketchBox style={{ marginTop: 10, textAlign: 'center' }} dashed>
              <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 14 }}>Both — the full works</div>
              <div style={{ fontSize: 11, color: SK.faint, marginTop: 2 }}>Color + Extensions combo</div>
            </SketchBox>
          </div>
        )}

        {variant === 2 && (
          <div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              border: `1.5px solid ${SK.line}`, borderRadius: 999,
              overflow: 'hidden',
            }}>
              {['Color', 'Ext.', 'Both'].map((t, i) => (
                <div key={i} style={{
                  padding: '10px 8px', textAlign: 'center', fontSize: 13,
                  fontFamily: SK.sans, fontWeight: 500,
                  background: i === 0 ? SK.ink : 'transparent',
                  color: i === 0 ? SK.paper : SK.ink,
                  borderRight: i < 2 ? `1.5px solid ${SK.line}` : 'none',
                }}>{t}</div>
              ))}
            </div>
            <SketchBox style={{ marginTop: 16 }}>
              <Label>Selected</Label>
              <div style={{ fontFamily: SK.serif, fontSize: 20, marginTop: 4 }}>Color Services</div>
              <div style={{ fontSize: 12, color: SK.faint, marginTop: 4, lineHeight: 1.4 }}>
                We'll ask about your current hair, goals & history. About 3 minutes.
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {['Full color', 'Highlights', 'Correction', 'Gloss'].map(x => <SketchChip key={x}>{x}</SketchChip>)}
              </div>
            </SketchBox>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 24, left: 20, right: 20,
      }}>
        <PrimaryBtn>Begin intake →</PrimaryBtn>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: SK.faint }}>
          Already a client? <span style={{ textDecoration: 'underline' }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Color Intake ──────────────────────────
function Screen_Color({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={1} total={6} title="Tell us about your color" sub="Starting point & goals" />

      <div style={{ padding: '12px 20px 20px' }}>
        <QLabel>What are you looking for?</QLabel>

        {variant === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Full color', 'Root to ends, single process'],
              ['Highlights / Balayage', 'Dimension & movement'],
              ['Color correction', 'Fix previous color'],
              ['Gloss / Toner', 'Shine & tone refresh'],
            ].map(([t, s], i) => (
              <SketchBox key={i} filled={i === 1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SketchRadio selected={i === 1} />
                  <div>
                    <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 14 }}>{t}</div>
                    <div style={{ fontSize: 12, color: SK.faint }}>{s}</div>
                  </div>
                </div>
              </SketchBox>
            ))}
          </div>
        )}

        {variant === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['Full color', 'Highlights', 'Balayage', 'Correction', 'Gloss', 'Toner'].map((t, i) => (
              <SketchBox key={t} filled={i === 1} style={{ textAlign: 'center', padding: '14px 8px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999, margin: '0 auto 6px',
                  border: `1.5px dashed ${SK.line}`,
                }} />
                <div style={{ fontFamily: SK.sans, fontSize: 13, fontWeight: 500 }}>{t}</div>
              </SketchBox>
            ))}
          </div>
        )}

        {variant === 2 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Full color', 'Highlights', 'Balayage', 'Foilyage', 'Babylights', 'Correction', 'Gloss', 'Toner', 'Root touch-up'].map((t, i) => (
              <SketchChip key={t} selected={i === 2}>{t}</SketchChip>
            ))}
          </div>
        )}

        <QLabel>Natural hair level</QLabel>
        {variant === 0 && <Input placeholder="e.g. 6 (dark blonde) — 1 black → 10 lightest blonde" />}
        {variant === 1 && (
          <div>
            <div style={{
              display: 'flex', height: 32, borderRadius: 6,
              border: `1.5px solid ${SK.line}`, overflow: 'hidden',
            }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const g = 250 - i * 25;
                return (
                  <div key={i} style={{
                    flex: 1,
                    background: `rgb(${g},${g - 10},${Math.max(g - 20, 30)})`,
                    borderRight: i < 9 ? `1px solid ${SK.paper}` : 'none',
                    position: 'relative',
                  }}>
                    {i === 5 && (
                      <div style={{
                        position: 'absolute', top: -4, bottom: -4, left: -2, right: -2,
                        border: `2px solid ${SK.accent}`, borderRadius: 4,
                      }}/>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>
              <span>1 black</span><span>selected: 6</span><span>10 blonde</span>
            </div>
          </div>
        )}
        {variant === 2 && (
          <div>
            <div style={{ position: 'relative', height: 6, background: SK.paperAlt, borderRadius: 3 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: '55%', background: SK.ink, borderRadius: 3 }} />
              <div style={{
                position: 'absolute', left: '55%', top: -7, width: 20, height: 20,
                background: SK.paper, border: `2px solid ${SK.ink}`, borderRadius: 999,
                transform: 'translateX(-50%)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, fontFamily: SK.mono, color: SK.faint }}>
              <span>1</span><span>Level 6</span><span>10</span>
            </div>
          </div>
        )}

        <QLabel>Previous chemical services</QLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Box dye', 'Salon color', 'Bleach', 'Relaxer', 'Keratin', 'Perm', 'None'].map((t, i) => (
            <SketchChip key={t} selected={i === 1 || i === 2}>{t}</SketchChip>
          ))}
        </div>

        <QLabel>Current color description</QLabel>
        <Input placeholder="e.g. Box dyed medium brown with grown-out roots" />
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Next →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 3: Extensions Intake ──────────────────────────
function Screen_Extensions({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={2} total={6} title="About your extensions" sub="Length, volume, method" />

      <div style={{ padding: '12px 20px 20px' }}>
        <QLabel>What are you hoping for?</QLabel>
        {variant === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Length', 'Longer hair'], ['Volume', 'Fuller look'], ['Both', 'Length + volume'], ['Fashion', 'Color streaks']].map(([t, s], i) => (
              <SketchBox key={t} filled={i === 2}>
                <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 11, color: SK.faint, marginTop: 2 }}>{s}</div>
              </SketchBox>
            ))}
          </div>
        )}
        {variant === 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Length', 'Volume', 'Both', 'Fashion streaks', 'Thickness', 'Cover thinning'].map((t, i) => (
              <SketchChip key={t} selected={i === 2}>{t}</SketchChip>
            ))}
          </div>
        )}
        {variant === 2 && (
          <SketchBox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Add length', 'Add volume', 'Cover thinning', 'Fashion/color pops'].map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SketchCheck selected={i === 0 || i === 1} />
                  <span style={{ fontFamily: SK.sans, fontSize: 14 }}>{t}</span>
                </div>
              ))}
            </div>
          </SketchBox>
        )}

        <QLabel>Current hair length</QLabel>
        {variant === 0 && <Input placeholder="e.g. Shoulder length" value="Shoulder length" />}
        {variant === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {['Ear', 'Chin', 'Shldr', 'Mid-back', 'Waist'].map((t, i) => (
              <div key={t} style={{
                border: `1.5px solid ${SK.line}`, borderRadius: 6,
                padding: '8px 4px', textAlign: 'center',
                fontSize: 11, fontFamily: SK.sans,
                background: i === 2 ? SK.ink : 'transparent',
                color: i === 2 ? SK.paper : SK.ink,
              }}>
                <div style={{ width: 2, margin: '0 auto 4px', background: 'currentColor', height: 4 + i * 6, borderRadius: 2 }} />
                {t}
              </div>
            ))}
          </div>
        )}
        {variant === 2 && (
          <div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[8, 14, 22, 34, 48].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: 60, borderRadius: 4,
                  border: `1.5px solid ${SK.line}`,
                  background: i === 2 ? SK.accentSoft : 'transparent',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4,
                }}>
                  <div style={{ width: 3, height: h, background: SK.ink, borderRadius: 2 }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 6, textAlign: 'center' }}>
              Tap the silhouette that matches
            </div>
          </div>
        )}

        <QLabel>Preferred method (if known)</QLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Tape-ins', 'K-tips', 'Hand-tied wefts', 'Clip-ins', 'Halo', 'Not sure'].map((t, i) => (
            <SketchChip key={t} selected={i === 2}>{t}</SketchChip>
          ))}
        </div>

        <QLabel>Desired length to add</QLabel>
        {variant !== 2 && <Input placeholder="e.g. 4–6 inches" />}
        {variant === 2 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SketchBox style={{ padding: '8px 12px', fontFamily: SK.mono }}>–</SketchBox>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: SK.serif, fontSize: 22 }}>+ 6 inches</div>
            <SketchBox style={{ padding: '8px 12px', fontFamily: SK.mono }}>+</SketchBox>
          </div>
        )}
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Next →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 4: Photo Upload ──────────────────────────
function Screen_Photos({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={3} total={6} title="Show us your hair" sub="Current photos + inspiration" />

      <div style={{ padding: '16px 20px 20px' }}>
        <Label>Current hair — 3 angles</Label>

        {variant === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['Front', 'Side', 'Back'].map((t, i) => (
              <div key={t}>
                <SketchBox dashed style={{
                  aspectRatio: '3/4', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 4,
                  background: i === 0 ? SK.paperAlt : 'transparent',
                }}>
                  <div style={{ fontSize: 22, color: SK.faint }}>{i === 0 ? '✓' : '+'}</div>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>{i === 0 ? 'img.jpg' : 'tap to add'}</div>
                </SketchBox>
                <div style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 4, textAlign: 'center' }}>{t}</div>
              </div>
            ))}
          </div>
        )}

        {variant === 1 && (
          <div>
            <SketchBox dashed style={{
              aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 6,
            }}>
              <div style={{ fontSize: 28, color: SK.faint }}>📷</div>
              <div style={{ fontFamily: SK.sans, fontWeight: 600 }}>Take photos</div>
              <div style={{ fontSize: 11, color: SK.faint }}>Guided capture · 3 angles</div>
            </SketchBox>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {['Front ✓', 'Side ○', 'Back ○'].map((t, i) => (
                <SketchChip key={t} selected={i === 0} style={{ flex: 1, justifyContent: 'center' }}>{t}</SketchChip>
              ))}
            </div>
          </div>
        )}

        {variant === 2 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {['Front', 'Side L', 'Side R', 'Back', 'Top'].map((t, i) => (
              <div key={t} style={{ flexShrink: 0, width: 100 }}>
                <SketchBox dashed={i > 0} filled={i === 0} style={{
                  aspectRatio: '3/4', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, color: SK.faint }}>{i === 0 ? '✓' : '+'}</span>
                </SketchBox>
                <div style={{ fontSize: 11, fontFamily: SK.mono, textAlign: 'center', marginTop: 4, color: SK.faint }}>{t}</div>
              </div>
            ))}
          </div>
        )}

        <Label style={{ marginTop: 24 }}>Inspiration — what you want</Label>
        {variant === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <SketchBox key={i} dashed={i === 2} filled={i < 2} style={{
                aspectRatio: '1', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20, color: SK.faint }}>{i === 2 ? '+' : '✓'}</span>
              </SketchBox>
            ))}
          </div>
        )}
        {variant === 1 && (
          <div>
            <SketchBox dashed style={{
              padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🔗</span>
              <div style={{ fontSize: 12, color: SK.faint, flex: 1 }}>Paste Pinterest / IG link</div>
            </SketchBox>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 8 }}>
              {[0, 1, 2].map(i => (
                <SketchBox key={i} filled style={{ aspectRatio: '1', padding: 0 }}/>
              ))}
            </div>
          </div>
        )}
        {variant === 2 && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {['Bright blonde', 'Soft balayage', 'Warm bronde', 'Copper', 'Ashy'].map((t, i) => (
                <SketchChip key={t} selected={i === 1}>{t}</SketchChip>
              ))}
            </div>
            <SketchBox dashed style={{
              aspectRatio: '2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint }}>+ Upload reference photos</span>
            </SketchBox>
          </div>
        )}
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Next →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 5: History ──────────────────────────
function Screen_History({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={4} total={6} title="Your hair history" sub="Anything we should know" />

      <div style={{ padding: '12px 20px 20px' }}>
        <QLabel>Last chemical service</QLabel>
        {variant === 0 && (
          <div>
            <Input placeholder="What & when?" value="Highlights, 3 months ago" />
          </div>
        )}
        {variant === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <Input placeholder="Service" value="Highlights" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {['< 1mo', '1–3mo', '3–6mo', '6mo+'].map((t, i) => (
                <SketchChip key={t} selected={i === 1} style={{ justifyContent: 'center' }}>{t}</SketchChip>
              ))}
            </div>
          </div>
        )}
        {variant === 2 && (
          <SketchBox>
            <Label>Timeline</Label>
            <div style={{ position: 'relative', height: 50, marginTop: 6 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 24, height: 1.5, background: SK.line }} />
              {[
                { l: 'Box dye', x: 0 },
                { l: 'Salon', x: 40 },
                { l: 'Highlights', x: 75 },
                { l: 'Today', x: 100 },
              ].map((e, i) => (
                <div key={i} style={{ position: 'absolute', left: `${e.x}%`, top: 18, transform: 'translateX(-50%)' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: SK.ink, border: `2px solid ${SK.paper}` }}/>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint, marginTop: 4, whiteSpace: 'nowrap' }}>{e.l}</div>
                </div>
              ))}
            </div>
          </SketchBox>
        )}

        <QLabel>Hair condition right now</QLabel>
        {variant === 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Healthy', 'Dry', 'Damaged', 'Brittle', 'Oily roots', 'Frizzy', 'Fine', 'Thick'].map((t, i) => (
              <SketchChip key={t} selected={[0, 5].includes(i)}>{t}</SketchChip>
            ))}
          </div>
        )}
        {variant === 1 && (
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint }}>damaged</span>
              <div style={{ flex: 1, height: 6, background: SK.paperAlt, borderRadius: 3, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '60%', top: -7, width: 20, height: 20, borderRadius: 999, background: SK.paper, border: `2px solid ${SK.ink}`, transform: 'translateX(-50%)' }} />
              </div>
              <span style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint }}>healthy</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontFamily: SK.serif, fontSize: 18 }}>Mostly healthy</div>
          </div>
        )}
        {variant === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Breakage', 'Split ends', 'Dryness', 'Oily scalp'].map((t, i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, fontSize: 13, fontFamily: SK.sans }}>{t}</div>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 22, borderRadius: 3,
                      border: `1.5px solid ${SK.line}`,
                      background: n <= (i === 0 ? 2 : i === 1 ? 3 : 1) ? SK.ink : 'transparent',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <QLabel>Allergies or sensitivities</QLabel>
        <Input placeholder="PPD, fragrance, none…" />

        <QLabel>Anything else?</QLabel>
        <SketchBox style={{ minHeight: 60 }}>
          <div style={{ fontSize: 13, color: SK.faint, fontFamily: SK.sans }}>
            Pregnancy, meds, pet peeves, dream outcomes…
          </div>
        </SketchBox>
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Next →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 6: Budget & Time ──────────────────────────
function Screen_Budget({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={5} total={6} title="Budget & time" sub="Helps us match the right plan" />

      <div style={{ padding: '12px 20px 20px' }}>
        <QLabel>Budget range</QLabel>
        {variant === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['$150–$300', 'Gloss, root touch-up'],
              ['$300–$600', 'Full color, highlights'],
              ['$600–$1000', 'Correction, balayage'],
              ['$1000+', 'Extensions & combos'],
            ].map(([t, s], i) => (
              <SketchBox key={t} filled={i === 1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SketchRadio selected={i === 1} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SK.sans, fontWeight: 600 }}>{t}</div>
                    <div style={{ fontSize: 12, color: SK.faint }}>{s}</div>
                  </div>
                </div>
              </SketchBox>
            ))}
          </div>
        )}
        {variant === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SK.serif, fontSize: 24 }}>
              <span>$350</span>
              <span style={{ color: SK.faint }}>—</span>
              <span>$650</span>
            </div>
            <div style={{ position: 'relative', height: 6, background: SK.paperAlt, borderRadius: 3, marginTop: 10 }}>
              <div style={{ position: 'absolute', left: '25%', right: '35%', height: 6, background: SK.ink, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: '25%', top: -7, width: 20, height: 20, borderRadius: 999, background: SK.paper, border: `2px solid ${SK.ink}`, transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', left: '65%', top: -7, width: 20, height: 20, borderRadius: 999, background: SK.paper, border: `2px solid ${SK.ink}`, transform: 'translateX(-50%)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 6 }}>
              <span>$100</span><span>$1500+</span>
            </div>
          </div>
        )}
        {variant === 2 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['$', '$$', '$$$', '$$$$'].map((t, i) => (
              <SketchBox key={t} filled={i === 1} style={{
                flex: 1, textAlign: 'center', padding: '14px 8px',
              }}>
                <div style={{ fontFamily: SK.serif, fontSize: 20 }}>{t}</div>
                <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint, marginTop: 4 }}>
                  {['<$200', '$200-500', '$500-1k', '$1k+'][i]}
                </div>
              </SketchBox>
            ))}
          </div>
        )}

        <QLabel>How much time can you spend?</QLabel>
        {variant === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {['1h', '2h', '4h', '6h+'].map((t, i) => (
              <SketchBox key={t} filled={i === 2} style={{ textAlign: 'center', padding: '14px 4px' }}>
                <div style={{ fontFamily: SK.serif, fontSize: 18 }}>{t}</div>
              </SketchBox>
            ))}
          </div>
        )}
        {variant === 1 && (
          <div>
            <div style={{ textAlign: 'center', fontFamily: SK.serif, fontSize: 28 }}>4 hours</div>
            <div style={{ position: 'relative', height: 6, background: SK.paperAlt, borderRadius: 3, marginTop: 10 }}>
              <div style={{ position: 'absolute', left: 0, height: 6, width: '55%', background: SK.ink, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: '55%', top: -7, width: 20, height: 20, borderRadius: 999, background: SK.paper, border: `2px solid ${SK.ink}`, transform: 'translateX(-50%)' }} />
            </div>
          </div>
        )}
        {variant === 2 && (
          <SketchBox>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Quick', 'Standard', 'Take my time'].map((t, i) => (
                <div key={t} style={{
                  flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 4,
                  background: i === 1 ? SK.ink : 'transparent',
                  color: i === 1 ? SK.paper : SK.ink,
                  fontFamily: SK.sans, fontSize: 13, fontWeight: 500,
                }}>{t}</div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 8, textAlign: 'center' }}>
              ~ 3 hours in the chair
            </div>
          </SketchBox>
        )}

        <QLabel>Maintenance preference</QLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Low-maint', '4-6wk touch-ups', '8-12wk', 'Whatever looks best'].map((t, i) => (
            <SketchChip key={t} selected={i === 2}>{t}</SketchChip>
          ))}
        </div>
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>See estimate →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 7: Estimate ──────────────────────────
function Screen_Estimate({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={5} total={6} title="Your estimate" sub="Based on what you shared" />

      <div style={{ padding: '16px 20px 20px' }}>
        {variant === 0 && (
          <>
            <SketchBox filled style={{ padding: 18 }}>
              <Label>Estimated total</Label>
              <div style={{ fontFamily: SK.serif, fontSize: 38, lineHeight: 1 }}>$480 – $620</div>
              <div style={{ fontSize: 12, color: SK.faint, marginTop: 6 }}>~ 4 hours · single visit</div>
            </SketchBox>

            <div style={{ marginTop: 16 }}>
              <Label>Breakdown</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
                {[
                  ['Full highlights', '$280'],
                  ['Root shadow', '$90'],
                  ['Gloss + blow-dry', '$80'],
                  ['Olaplex add-on', '$30'],
                ].map(([l, v], i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: `1px dashed ${SK.paperAlt}`,
                    fontFamily: SK.sans, fontSize: 14,
                  }}>
                    <span>{l}</span><span style={{ fontFamily: SK.mono }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {variant === 1 && (
          <>
            <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
              <Label>Estimated total</Label>
              <div style={{ fontFamily: SK.serif, fontSize: 56, lineHeight: 1 }}>$550</div>
              <div style={{ fontSize: 12, color: SK.faint, marginTop: 6 }}>± $70 · ~4 hours</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Good fit', 'Your budget', 'Time ok'].map((t, i) => (
                <SketchBox key={t} style={{ flex: 1, textAlign: 'center', padding: '10px 6px' }}>
                  <div style={{ fontSize: 16 }}>✓</div>
                  <div style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 4 }}>{t}</div>
                </SketchBox>
              ))}
            </div>
            <SketchBox style={{ marginTop: 12 }}>
              <Label>Recommended plan</Label>
              <div style={{ fontFamily: SK.serif, fontSize: 18, marginTop: 4 }}>
                Partial highlights + gloss
              </div>
              <div style={{ fontSize: 12, color: SK.faint, marginTop: 6, lineHeight: 1.4 }}>
                Keeps your natural tone visible while brightening the top. Low maintenance.
              </div>
            </SketchBox>
          </>
        )}

        {variant === 2 && (
          <>
            <Label>Pick a tier</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {[
                ['Essential', '$380', 'Root + gloss', false],
                ['Signature', '$550', 'Highlights + gloss + treatment', true],
                ['Transformation', '$820', 'Full color + extensions consult', false],
              ].map(([t, p, s, sel], i) => (
                <SketchBox key={t} filled={sel} thick={sel}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SketchRadio selected={sel} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: SK.sans, fontWeight: 600 }}>{t}</span>
                        <span style={{ fontFamily: SK.serif, fontSize: 20 }}>{p}</span>
                      </div>
                      <div style={{ fontSize: 12, color: SK.faint, marginTop: 2 }}>{s}</div>
                    </div>
                  </div>
                </SketchBox>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 16, fontSize: 11, fontFamily: SK.mono, color: SK.faint, lineHeight: 1.5 }}>
          * Final quote confirmed at consultation. Prices vary by length/density.
        </div>
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Edit</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Book →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 8: Booking ──────────────────────────
function Screen_Booking({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper, paddingBottom: 90 }}>
      <ScreenHeader step={6} total={6} title="Pick a time" sub="With Sam · your stylist match" />

      <div style={{ padding: '12px 20px 20px' }}>
        {variant === 0 && (
          <>
            <Label>Stylist</Label>
            <SketchBox style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 999,
                border: `1.5px dashed ${SK.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SK.mono, fontSize: 10, color: SK.faint,
              }}>ph</div>
              <div>
                <div style={{ fontFamily: SK.sans, fontWeight: 600 }}>Sam Rivera</div>
                <div style={{ fontSize: 12, color: SK.faint }}>Color specialist · 8 yrs</div>
              </div>
            </SketchBox>

            <Label style={{ marginTop: 20 }}>April 2026</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontFamily: SK.mono, fontSize: 10, color: SK.faint, marginBottom: 4 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ textAlign: 'center' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const d = i + 1;
                const avail = [3, 5, 8, 12, 15, 18, 22, 25].includes(d);
                const sel = d === 15;
                return (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 6,
                    border: `1.5px solid ${avail ? SK.line : SK.paperAlt}`,
                    background: sel ? SK.ink : 'transparent',
                    color: sel ? SK.paper : avail ? SK.ink : SK.faint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontFamily: SK.sans,
                  }}>{d}</div>
                );
              })}
            </div>

            <Label style={{ marginTop: 20 }}>Times · Apr 15</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {['9:00', '11:00', '1:30', '3:00', '4:30', '6:00'].map((t, i) => (
                <SketchBox key={t} filled={i === 2} style={{ textAlign: 'center', padding: '10px 4px' }}>
                  <span style={{ fontFamily: SK.sans, fontSize: 13 }}>{t}</span>
                </SketchBox>
              ))}
            </div>
          </>
        )}

        {variant === 1 && (
          <>
            <Label>Pick a stylist</Label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {[
                ['Sam', 'Color', true],
                ['Mia', 'Extensions', false],
                ['Jay', 'Both', false],
                ['Kim', 'Color', false],
              ].map(([n, s, sel]) => (
                <SketchBox key={n} filled={sel} thick={sel} style={{ width: 100, flexShrink: 0, textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 999, margin: '0 auto 6px',
                    border: `1.5px dashed ${SK.line}`,
                  }} />
                  <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 13 }}>{n}</div>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>{s}</div>
                </SketchBox>
              ))}
            </div>

            <Label style={{ marginTop: 16 }}>Next available slots</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Tue Apr 15', '1:30 PM', '4 hrs'],
                ['Wed Apr 16', '10:00 AM', '4 hrs'],
                ['Fri Apr 18', '9:00 AM', '4 hrs'],
                ['Mon Apr 21', '2:00 PM', '4 hrs'],
              ].map(([d, t, dur], i) => (
                <SketchBox key={i} filled={i === 0}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: SK.sans, fontWeight: 600, fontSize: 14 }}>{d}</div>
                      <div style={{ fontSize: 11, color: SK.faint, marginTop: 2 }}>{dur}</div>
                    </div>
                    <div style={{ fontFamily: SK.serif, fontSize: 18 }}>{t}</div>
                  </div>
                </SketchBox>
              ))}
            </div>
          </>
        )}

        {variant === 2 && (
          <>
            <Label>This week</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {[
                ['MON', '14', 'Sam, Mia', 3],
                ['TUE', '15', 'Sam, Jay, Kim', 5],
                ['WED', '16', 'Mia', 1],
                ['THU', '17', '—', 0],
                ['FRI', '18', 'Sam, Jay', 4],
                ['SAT', '19', 'Sam, Mia, Jay, Kim', 7],
              ].map(([d, n, s, c], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: `1px dashed ${SK.paperAlt}`,
                  opacity: c === 0 ? 0.4 : 1,
                }}>
                  <div style={{ width: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>{d}</div>
                    <div style={{ fontFamily: SK.serif, fontSize: 22, lineHeight: 1 }}>{n}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: SK.sans }}>{c === 0 ? 'No availability' : `${c} slots`}</div>
                    <div style={{ fontSize: 11, color: SK.faint, marginTop: 2 }}>{s}</div>
                  </div>
                  {c > 0 && <span style={{ color: SK.faint, fontSize: 18 }}>›</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomBar>
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn ghost style={{ flex: 1 }}>Back</PrimaryBtn>
          <PrimaryBtn style={{ flex: 2 }}>Confirm →</PrimaryBtn>
        </div>
      </BottomBar>
    </div>
  );
}

// ─── Screen 9: Confirmation ──────────────────────────
function Screen_Confirm({ variant }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: SK.paper }}>
      {variant === 0 && (
        <div style={{ padding: '80px 24px 20px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 999, margin: '0 auto',
            border: `2px solid ${SK.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>✓</div>
          <div style={{ fontFamily: SK.serif, fontSize: 30, marginTop: 20, lineHeight: 1.1 }}>
            You're booked
          </div>
          <div style={{ fontSize: 13, color: SK.faint, marginTop: 8, fontFamily: SK.sans }}>
            See you soon, Jamie
          </div>

          <SketchBox filled style={{ marginTop: 24, textAlign: 'left' }}>
            <Label>Appointment</Label>
            <div style={{ fontFamily: SK.serif, fontSize: 22, marginTop: 4 }}>Tue, Apr 15 · 1:30 PM</div>
            <div style={{ fontSize: 13, color: SK.faint, marginTop: 4 }}>with Sam · Luxe Hair Studio</div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${SK.paperAlt}`,
              fontFamily: SK.sans, fontSize: 13,
            }}>
              <span>Partial highlights + gloss</span>
              <span style={{ fontFamily: SK.mono }}>$480–620</span>
            </div>
          </SketchBox>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <PrimaryBtn ghost style={{ flex: 1 }}>Add to cal</PrimaryBtn>
            <PrimaryBtn ghost style={{ flex: 1 }}>Directions</PrimaryBtn>
          </div>
        </div>
      )}

      {variant === 1 && (
        <div style={{ padding: '60px 20px 20px' }}>
          <Label>Confirmation · #4821</Label>
          <div style={{ fontFamily: SK.serif, fontSize: 32, marginTop: 6, lineHeight: 1.1 }}>
            All set.
          </div>
          <div style={{ fontSize: 13, color: SK.faint, marginTop: 8 }}>
            Your intake is saved. Sam got your notes.
          </div>

          <div style={{
            marginTop: 24, border: `1.5px solid ${SK.line}`, borderRadius: 10, padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint, letterSpacing: 1 }}>WHEN</div>
                <div style={{ fontFamily: SK.serif, fontSize: 20, marginTop: 2 }}>Apr 15</div>
                <div style={{ fontSize: 13 }}>1:30 PM</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint, letterSpacing: 1 }}>WITH</div>
                <div style={{ fontFamily: SK.serif, fontSize: 20, marginTop: 2 }}>Sam R.</div>
                <div style={{ fontSize: 13 }}>color</div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${SK.paperAlt}` }}>
              <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint, letterSpacing: 1 }}>SERVICE</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Partial highlights + gloss · ~4 hrs</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Label>Prep notes</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {[
                'Arrive with hair clean & dry',
                'Skip oils & heavy conditioners',
                'Bring inspiration photos saved',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
                  <span style={{ color: SK.accent, fontFamily: SK.mono }}>○</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {variant === 2 && (
        <div style={{ padding: '60px 20px 20px' }}>
          <div style={{
            border: `1.5px solid ${SK.line}`, borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ background: SK.ink, color: SK.paper, padding: '18px 18px 14px' }}>
              <div style={{ fontSize: 10, fontFamily: SK.mono, letterSpacing: 1, opacity: 0.6 }}>LUXE HAIR STUDIO</div>
              <div style={{ fontFamily: SK.serif, fontSize: 24, marginTop: 10 }}>Booking confirmed</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>#4821 · Jamie Chen</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>DATE</div>
                  <div style={{ fontFamily: SK.serif, fontSize: 28, lineHeight: 1, marginTop: 6 }}>15</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>Tue, Apr</div>
                </div>
                <div style={{ width: 1, background: SK.paperAlt }} />
                <div>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>TIME</div>
                  <div style={{ fontFamily: SK.serif, fontSize: 28, lineHeight: 1, marginTop: 6 }}>1:30</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>PM · 4 hr</div>
                </div>
                <div style={{ width: 1, background: SK.paperAlt }} />
                <div>
                  <div style={{ fontSize: 10, fontFamily: SK.mono, color: SK.faint }}>EST.</div>
                  <div style={{ fontFamily: SK.serif, fontSize: 28, lineHeight: 1, marginTop: 6 }}>$550</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>±$70</div>
                </div>
              </div>
            </div>
          </div>

          <SketchBox style={{ marginTop: 14 }}>
            <Label>Your intake summary</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, fontSize: 13 }}>
              {[
                ['Service', 'Partial highlights + gloss'],
                ['Natural level', '6'],
                ['Condition', 'Healthy, slight frizz'],
                ['Budget', '$350–650'],
                ['Time', 'Up to 4 hrs'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SK.sans }}>
                  <span style={{ color: SK.faint }}>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </SketchBox>

          <div style={{ fontSize: 11, fontFamily: SK.mono, color: SK.faint, marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
            Confirmation sent to jamie@email.com<br/>
            Reschedule up to 24h before
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  Screen_Service, Screen_Color, Screen_Extensions, Screen_Photos,
  Screen_History, Screen_Budget, Screen_Estimate, Screen_Booking, Screen_Confirm,
  SK,
});
