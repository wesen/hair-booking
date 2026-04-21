// Modern Zine — Responsive (Plum + Peach) · Desktop editorial layout

function HistoryResponsive_ModernZine() {
  const C = {
    paper: '#ffffff',
    ink: '#111111',
    soft: '#9a958e',
    rule: '#ebe7df',
    plum: '#6b3a4a',
    peach: '#f2b89a',
    cream: '#f6efe4',
    peachSoft: '#faddc9',
  };
  const block = '"Anton", "Oswald", Impact, sans-serif';
  const serif = '"Instrument Serif", Georgia, serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';

  const [w, setW] = React.useState(() => window.innerWidth);
  React.useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const isDesktop = w >= 960;

  // Mobile version: basically History_ModernZine unchanged
  if (!isDesktop) {
    return (
      <div style={{ background: '#f2b89a', minHeight: '100vh', padding: w >= 500 ? '40px 20px' : 0 }}>
        <div style={{ maxWidth: 440, margin: '0 auto', background: C.paper, minHeight: w >= 500 ? 'auto' : '100vh', boxShadow: w >= 500 ? '0 20px 60px rgba(0,0,0,0.15)' : 'none', position: 'relative' }}>
          <MobileModernZine C={C} block={block} serif={serif} mono={mono}/>
        </div>
      </div>
    );
  }
  return <DesktopModernZine C={C} block={block} serif={serif} mono={mono}/>;
}

function MobileModernZine({ C, block, serif, mono }) {
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: serif }}>
      <header style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round"><path d="M11 4L5 9l6 5"/></svg>
        </button>
        <div style={{ fontFamily: block, fontSize: 16, color: C.ink, letterSpacing: 4, textTransform: 'uppercase' }}>Fringe</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>05 / 06</div>
      </header>

      <div style={{ background: C.peach, margin: '16px 22px 0', padding: '20px 20px 22px', position: 'relative' }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>
          CHAPTER V · THE RECORD
        </div>
        <div style={{ fontFamily: block, fontSize: 54, lineHeight: 0.88, letterSpacing: -0.5, textTransform: 'uppercase', color: C.plum }}>
          Your hair,<br/><span style={{ color: C.ink }}>on file.</span>
        </div>
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: mono, fontSize: 10, color: C.plum, border: `1px solid ${C.plum}`, padding: '2px 6px', letterSpacing: 1.5, fontWeight: 600 }}>05/06</div>
      </div>

      <div style={{ padding: '22px 22px 120px' }}>
        <QBody C={C} block={block} serif={serif} mono={mono}/>
      </div>

      <Footer C={C} block={block}/>
    </div>
  );
}

function DesktopModernZine({ C, block, serif, mono }) {
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: serif }}>
      <header style={{
        padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.rule}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ fontFamily: block, fontSize: 22, color: C.ink, letterSpacing: 5, textTransform: 'uppercase' }}>Fringe</div>
          <nav style={{ display: 'flex', gap: 22, fontFamily: mono, fontSize: 11, color: C.soft, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            <span>Service</span><span>Color</span><span>Extensions</span><span>Photos</span>
            <span style={{ color: C.ink, borderBottom: `1.5px solid ${C.plum}`, paddingBottom: 2, fontWeight: 600 }}>History</span>
            <span>Budget</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, letterSpacing: 1.5 }}>05 / 06</div>
          <div style={{ width: 160, height: 3, background: C.rule }}>
            <div style={{ width: '83%', height: 3, background: C.plum }}/>
          </div>
          <button style={{ background: 'transparent', border: `1px solid ${C.rule}`, padding: '8px 14px', fontFamily: block, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: C.ink, cursor: 'pointer' }}>Save & exit</button>
        </div>
      </header>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 80px)' }}>

        {/* Left: masthead / context / quote */}
        <aside style={{ background: C.peach, padding: '60px 56px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.plum, letterSpacing: 2.5, marginBottom: 20, fontWeight: 600 }}>
              CHAPTER V · THE RECORD
            </div>
            <div style={{ fontFamily: block, fontSize: 120, lineHeight: 0.85, letterSpacing: -2, textTransform: 'uppercase', color: C.plum }}>
              Your<br/>hair,<br/><span style={{ color: C.ink }}>on<br/>file.</span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 20, fontStyle: 'italic', color: C.plum, marginTop: 28, lineHeight: 1.4, maxWidth: 420 }}>
              Five questions so we can cut, color and care for it right. All optional. Everything private.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 48, gap: 20 }}>
            <div style={{
              background: C.cream, padding: '16px 20px', maxWidth: 280,
              borderLeft: `3px solid ${C.plum}`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>A NOTE FROM YOUR STYLIST</div>
              <div style={{ fontFamily: serif, fontSize: 15, fontStyle: 'italic', color: C.ink, lineHeight: 1.4 }}>
                "The more we know, the better the result. Take your time."
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, marginTop: 6, letterSpacing: 1 }}>— NADIA, COLORIST</div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.plum, letterSpacing: 2, fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              VOL.01 · ISSUE.05
            </div>
          </div>
        </aside>

        {/* Right: form */}
        <main style={{ padding: '60px 56px 80px', overflowY: 'auto' }}>
          <QBody C={C} block={block} serif={serif} mono={mono} desktop/>

          <div style={{ display: 'flex', gap: 14, marginTop: 40, alignItems: 'center' }}>
            <button style={{
              padding: '16px 22px',
              background: 'transparent', border: `1px solid ${C.ink}`,
              fontFamily: block, fontSize: 15, letterSpacing: 1.8,
              textTransform: 'uppercase', color: C.ink, cursor: 'pointer',
            }}>
              Skip
            </button>
            <button style={{
              flex: 1, padding: '16px 24px',
              background: C.plum, color: C.paper, border: 'none',
              fontFamily: block, fontSize: 20, letterSpacing: 2.5,
              textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              Keep Going <span style={{ color: C.peach }}>→</span>
            </button>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.soft, letterSpacing: 1.5, whiteSpace: 'nowrap' }}>
              ⏎ to continue
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Shared question body
function QBody({ C, block, serif, mono, desktop }) {
  const D = {
    lastService: 'Partial highlights', lastWhen: '3 months ago', allergies: 'None',
    conditions: [
      { label: 'Breakage', v: 2 }, { label: 'Split ends', v: 3 },
      { label: 'Dryness', v: 1 }, { label: 'Oily scalp', v: 1 }, { label: 'Frizz', v: 3 },
    ],
    chips: ['Healthy', 'Dry', 'Damaged', 'Brittle', 'Oily', 'Frizzy', 'Fine', 'Thick', 'Color-treated'],
    sel: ['Healthy', 'Frizzy'],
    notes: "Usually wash twice a week. Ends feel crunchy in winter. Dream outcome: lived-in blonde that doesn't need tons of toning.",
  };

  const label = (n, text) => (
    <div style={{ fontFamily: mono, fontSize: desktop ? 11 : 10, color: C.plum, letterSpacing: 1.8, fontWeight: 600, marginBottom: 12 }}>
      {n} — {text}
    </div>
  );

  return (
    <>
      {/* Q1 */}
      <div style={{
        background: C.cream, padding: desktop ? '20px 24px' : '16px 18px', marginBottom: 10,
        borderLeft: `3px solid ${C.plum}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.plum, letterSpacing: 1.8, fontWeight: 600 }}>
            01 — LAST CHEMICAL SERVICE
          </div>
          <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.soft, cursor: 'pointer' }}>edit</div>
        </div>
        <div style={{ fontFamily: block, fontSize: desktop ? 34 : 26, color: C.ink, textTransform: 'uppercase', lineHeight: 1, letterSpacing: 0.3 }}>
          {D.lastService}
        </div>
        <div style={{ fontFamily: serif, fontSize: desktop ? 18 : 16, fontStyle: 'italic', color: C.plum, marginTop: 4 }}>
          {D.lastWhen}
        </div>
      </div>

      {/* Q2 */}
      <div style={{ padding: '18px 0 22px' }}>
        {label('02', 'CURRENT CONDITION · SELECT ANY')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {D.chips.map(chip => {
            const sel = D.sel.includes(chip);
            return (
              <span key={chip} style={{
                fontFamily: block, fontSize: desktop ? 14 : 13, textTransform: 'uppercase',
                padding: desktop ? '8px 16px 6px' : '6px 12px 4px', letterSpacing: 1,
                border: `1px solid ${sel ? C.plum : C.rule}`,
                background: sel ? C.plum : 'transparent',
                color: sel ? C.paper : C.ink,
                borderRadius: 100, cursor: 'pointer',
              }}>{chip}</span>
            );
          })}
        </div>
      </div>

      {/* Q3 */}
      <div style={{ padding: '18px 0 22px', borderTop: `1px solid ${C.rule}` }}>
        {label('03', 'CONDITION · 1 POOR, 5 GREAT')}
        {D.conditions.map(({ label: lbl, v }) => {
          const fill = v <= 2 ? C.peach : v <= 3 ? C.plum : C.ink;
          return (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
              <div style={{ fontFamily: block, fontSize: desktop ? 16 : 14, color: C.ink, textTransform: 'uppercase', width: desktop ? 140 : 100, letterSpacing: 0.5 }}>{lbl}</div>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ flex: 1, height: desktop ? 10 : 8, background: n <= v ? fill : C.rule, borderRadius: 2 }}/>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: C.soft, width: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}/5</div>
            </div>
          );
        })}
      </div>

      {/* Q4 */}
      <div style={{ padding: '18px 0 22px', borderTop: `1px solid ${C.rule}` }}>
        {label('04', 'ANYTHING ELSE WE SHOULD KNOW')}
        <div style={{
          fontFamily: serif, fontSize: desktop ? 19 : 17, lineHeight: 1.45, color: C.ink,
          fontStyle: 'italic', minHeight: desktop ? 110 : 80,
          background: C.cream, padding: desktop ? '18px 22px' : '14px 16px',
        }}>
          "{D.notes}"
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.soft, marginTop: 6, textAlign: 'right', letterSpacing: 1 }}>
          147 / 500
        </div>
      </div>

      {/* Q5 */}
      <div style={{ padding: '18px 0 0', borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.plum, letterSpacing: 1.8, fontWeight: 600, marginBottom: 4 }}>05A — ALLERGIES</div>
          <div style={{ fontFamily: block, fontSize: desktop ? 28 : 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>{D.allergies}</div>
        </div>
        <div style={{ width: 1, background: C.rule }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.plum, letterSpacing: 1.8, fontWeight: 600, marginBottom: 4 }}>05B — PREGNANCY</div>
          <div style={{ fontFamily: block, fontSize: desktop ? 28 : 22, color: C.ink, textTransform: 'uppercase', lineHeight: 1 }}>No</div>
        </div>
      </div>
    </>
  );
}

function Footer({ C, block }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 22px 22px', background: C.paper, borderTop: `1px solid ${C.rule}`, display: 'flex', gap: 10 }}>
      <button style={{ padding: '14px 18px', background: 'transparent', border: `1px solid ${C.ink}`, fontFamily: block, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase', color: C.ink, cursor: 'pointer' }}>Skip</button>
      <button style={{ flex: 1, padding: '14px 20px', background: C.plum, color: C.paper, border: 'none', fontFamily: block, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        Keep Going <span style={{ color: C.peach }}>→</span>
      </button>
    </div>
  );
}

window.HistoryResponsive_ModernZine = HistoryResponsive_ModernZine;
