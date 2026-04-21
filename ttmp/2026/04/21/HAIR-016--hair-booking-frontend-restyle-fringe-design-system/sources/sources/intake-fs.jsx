// Intake screens built on FS design system.
// 9 screens for the hair intake flow, each a single-variant hi-fi version.

const { FS } = window;

const INTAKE = {
  service: 'Partial highlights + cut',
  colorLevel: 7,
  length: 'Mid-back',
  photos: 3,
  history: 'Breakage 2/5 · Frizz 3/5',
  budget: '$220 – $280',
  estimate: '$245 · 3h 15m',
  stylist: 'Nadia Rivera',
  slot: 'Tue, Jun 18 · 2:00p',
};

function IntakeShell({ step, total, title, eyebrow, children }) {
  return (
    <div style={{ height: '100%', background: FS.color.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FS.StatusBar/>
      <FS.AppHeader step={step} total={total}/>
      <div style={{ padding: '8px 22px 0' }}>
        <FS.Progress value={(step / total) * 100}/>
      </div>
      <div style={{ padding: '22px 22px 8px' }}>
        {eyebrow && <FS.Eyebrow style={{ marginBottom: 8 }}>{eyebrow}</FS.Eyebrow>}
        <div style={{ ...FS.type.display3, fontSize: 40, color: FS.color.ink, letterSpacing: -0.3 }}>
          {title}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 100px' }}>
        {children}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 22px', background: FS.color.paper, borderTop: `1px solid ${FS.color.rule}`, display: 'flex', gap: 10 }}>
        <FS.Button variant="secondary">Skip</FS.Button>
        <FS.Button variant="primary" size="lg" style={{ flex: 1 }}>
          Keep going <span style={{ color: FS.color.peach }}>→</span>
        </FS.Button>
      </div>
      <FS.HomeIndicator/>
    </div>
  );
}

// 01 Service
function S_Service() {
  const services = [
    { k: 'Cut',          d: 'Trim · restyle · bangs', rate: '$80+' },
    { k: 'Color',        d: 'Single process · gloss · root touch-up', rate: '$120+' },
    { k: 'Highlights',   d: 'Partial · full · balayage', rate: '$180+', sel: true },
    { k: 'Extensions',   d: 'Tape-in · hand-tied · consultation first', rate: '$400+' },
    { k: 'Treatment',    d: 'Olaplex · bond-repair · scalp', rate: '$60+' },
  ];
  return (
    <IntakeShell step={1} total={9} eyebrow="Chapter I · The Ask" title="What brings you in?">
      <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginBottom: 18 }}>
        Pick one to start — you can add more later.
      </div>
      {services.map(s => (
        <div key={s.k} style={{
          padding: '14px 16px', marginBottom: 8,
          background: s.sel ? FS.color.peachSoft : FS.color.cream,
          borderLeft: `3px solid ${s.sel ? FS.color.plum : 'transparent'}`,
          display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...FS.type.h3, fontSize: 20 }}>{s.k}</div>
            <div style={{ ...FS.type.bodySm, color: FS.color.softInk, marginTop: 2 }}>{s.d}</div>
          </div>
          <div style={{ ...FS.type.meta, color: FS.color.plum }}>{s.rate}</div>
        </div>
      ))}
    </IntakeShell>
  );
}

// 02 Color
function S_Color() {
  const levels = [1,2,3,4,5,6,7,8,9,10];
  const current = 7;
  return (
    <IntakeShell step={2} total={9} eyebrow="Chapter II · The Tone" title="Current level">
      <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginBottom: 20 }}>
        Slide to your starting point. 1 is black, 10 is platinum.
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, marginBottom: 18 }}>
        {levels.map(l => {
          const tone = `hsl(30, ${20 + l*3}%, ${10 + l*8}%)`;
          const sel = l === current;
          return (
            <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, width: '100%', background: tone, border: sel ? `2px solid ${FS.color.plum}` : 'none', marginBottom: 4 }}/>
              <div style={{ ...FS.type.meta, color: sel ? FS.color.plum : FS.color.soft, fontSize: 10 }}>{l}</div>
            </div>
          );
        })}
      </div>
      <FS.Note tone="info">
        You're at <strong>Level {current}</strong> — dark blonde with warm undertones.
      </FS.Note>
      <div style={{ marginTop: 20 }}>
        <FS.Eyebrow style={{ marginBottom: 10 }}>Target (optional)</FS.Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Stay the same', 'Go 1 shade lighter', 'Go 2 shades lighter', 'Darker', 'Dimensional'].map((c,i) => (
            <FS.Chip key={c} selected={i === 1}>{c}</FS.Chip>
          ))}
        </div>
      </div>
    </IntakeShell>
  );
}

// 03 Length + Extensions
function S_Extensions() {
  return (
    <IntakeShell step={3} total={9} eyebrow="Chapter III · The Length" title="How long is it now?">
      <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginBottom: 20 }}>
        Pick the silhouette that matches best today.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
        {[
          { l: 'Pixie', h: 30 },
          { l: 'Bob', h: 52 },
          { l: 'Shoulder', h: 72 },
          { l: 'Mid-back', h: 100, sel: true },
        ].map(s => (
          <div key={s.l} style={{
            background: s.sel ? FS.color.peachSoft : FS.color.cream,
            border: s.sel ? `1.5px solid ${FS.color.plum}` : `1px solid ${FS.color.rule}`,
            padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            minHeight: 150, justifyContent: 'flex-end',
          }}>
            <svg viewBox="0 0 40 120" style={{ flex: 1, width: '100%' }}>
              <circle cx="20" cy="14" r="10" fill={FS.color.plum}/>
              <path d={`M8 24 Q 20 ${24 + s.h * 0.8} 32 24`} stroke={FS.color.plum} strokeWidth="3" fill="none"/>
              <path d={`M10 24 L 8 ${24 + s.h}`} stroke={FS.color.plum} strokeWidth="2" fill="none"/>
              <path d={`M30 24 L 32 ${24 + s.h}`} stroke={FS.color.plum} strokeWidth="2" fill="none"/>
            </svg>
            <div style={{ ...FS.type.eyebrow, color: s.sel ? FS.color.plum : FS.color.soft, fontSize: 10 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <FS.Eyebrow style={{ marginBottom: 12 }}>Extensions</FS.Eyebrow>
      <FS.Segmented value="none" options={[{value:'none',label:'None'},{value:'taped',label:'Tape-in'},{value:'tied',label:'Hand-tied'}]}/>
    </IntakeShell>
  );
}

// 04 Photos
function S_Photos() {
  return (
    <IntakeShell step={4} total={9} eyebrow="Chapter IV · The Reference" title="Three angles, please.">
      <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginBottom: 20 }}>
        Front, side, and back in natural light. Helps more than you'd think.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        <FS.PhotoTile label="Front" filled/>
        <FS.PhotoTile label="Side" filled/>
        <FS.PhotoTile label="Back"/>
      </div>
      <FS.Eyebrow style={{ marginBottom: 12 }}>Inspiration (optional · up to 4)</FS.Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ aspectRatio: '1', background: i < 3 ? FS.color.peach : FS.color.cream, border: `1px solid ${i < 3 ? FS.color.plum : FS.color.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 3 ? FS.color.plum : FS.color.soft, fontFamily: FS.font.block, fontSize: 20 }}>
            {i < 3 ? '✓' : '+'}
          </div>
        ))}
      </div>
    </IntakeShell>
  );
}

// 05 History — reuses our final Modern Zine look
function S_History() {
  const chips = ['Healthy', 'Frizzy'];
  return (
    <IntakeShell step={5} total={9} eyebrow="Chapter V · The Record" title="Hair history">
      <FS.Card accent={FS.color.plum} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <FS.Eyebrow>01 — LAST SERVICE</FS.Eyebrow>
          <div style={{ ...FS.type.editorial, fontSize: 14, color: FS.color.soft }}>edit</div>
        </div>
        <div style={{ ...FS.type.h2, fontSize: 22 }}>Partial highlights</div>
        <div style={{ ...FS.type.editorial, color: FS.color.plum, fontSize: 16, marginTop: 2 }}>3 months ago</div>
      </FS.Card>

      <div style={{ padding: '10px 0 14px' }}>
        <FS.Eyebrow style={{ marginBottom: 10 }}>02 — CURRENT CONDITION</FS.Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Healthy','Dry','Damaged','Brittle','Oily','Frizzy','Fine','Thick','Color-treated'].map(c => (
            <FS.Chip key={c} selected={chips.includes(c)}>{c}</FS.Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 0', borderTop: `1px solid ${FS.color.rule}` }}>
        <FS.Eyebrow style={{ marginBottom: 12 }}>03 — RATE CONDITION</FS.Eyebrow>
        <FS.RatingBar label="Breakage" value={2}/>
        <FS.RatingBar label="Split ends" value={3}/>
        <FS.RatingBar label="Dryness" value={1}/>
        <FS.RatingBar label="Frizz" value={3}/>
      </div>
    </IntakeShell>
  );
}

// 06 Budget
function S_Budget() {
  const tiers = [
    { k: 'Under $150', d: 'Cut or single-service touch-up' },
    { k: '$150 – $250', d: 'Partial color + cut', sel: true },
    { k: '$250 – $400', d: 'Full color · highlights + cut' },
    { k: '$400+', d: 'Extensions · correction · balayage' },
  ];
  return (
    <IntakeShell step={6} total={9} eyebrow="Chapter VI · The Budget" title="Comfortable range?">
      <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginBottom: 20 }}>
        Helps us match you to the right stylist. Tips not included.
      </div>
      {tiers.map(t => (
        <div key={t.k} style={{
          padding: '16px 18px', marginBottom: 8,
          background: t.sel ? FS.color.peachSoft : FS.color.cream,
          borderLeft: `3px solid ${t.sel ? FS.color.plum : 'transparent'}`,
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${t.sel ? FS.color.plum : FS.color.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {t.sel && <div style={{ width: 8, height: 8, borderRadius: 999, background: FS.color.plum }}/>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...FS.type.h3, fontSize: 19 }}>{t.k}</div>
            <div style={{ ...FS.type.bodySm, color: FS.color.softInk, marginTop: 2 }}>{t.d}</div>
          </div>
        </div>
      ))}
    </IntakeShell>
  );
}

// 07 Estimate
function S_Estimate() {
  return (
    <IntakeShell step={7} total={9} eyebrow="Chapter VII · The Quote" title="Your estimate">
      <FS.Masthead eyebrow="ESTIMATED TOTAL" title="$245" right="3h 15m" compact/>
      <div style={{ height: 16 }}/>
      <FS.SummaryRow label="Service" value="Partial highlights + cut" onEdit={() => {}}/>
      <FS.SummaryRow label="Color level" value="Level 7 → Level 8" onEdit={() => {}}/>
      <FS.SummaryRow label="Length" value="Mid-back · no extensions" onEdit={() => {}}/>
      <FS.SummaryRow label="Add-ons" value="Olaplex bond treatment · $45"/>
      <div style={{ marginTop: 20 }}>
        <FS.Note tone="warn">
          Estimate only. Final cost depends on in-salon assessment of current color and condition.
        </FS.Note>
      </div>
    </IntakeShell>
  );
}

// 08 Booking
function S_Booking() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <IntakeShell step={8} total={9} eyebrow="Chapter VIII · The Date" title="When suits you?">
      <FS.StylistCard name="Nadia Rivera" role="Senior colorist · Lived-in blonde" rate="$180+" available="Available Tue 2:00p"/>
      <div style={{ height: 20 }}/>
      <FS.Eyebrow style={{ marginBottom: 10 }}>June 2025</FS.Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ ...FS.type.meta, color: FS.color.soft, textAlign: 'center', padding: 4 }}>{d}</div>
        ))}
        {days.slice(0, 28).map(d => (
          <FS.DayCell key={d} day={d} selected={d === 18} disabled={d < 12} dot={[14,17,18,19,23].includes(d)}/>
        ))}
      </div>
      <FS.Eyebrow style={{ marginBottom: 10 }}>Tue, Jun 18 — available times</FS.Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {['10:30a','12:00p','2:00p','4:30p'].map((t, i) => (
          <div key={t} style={{
            padding: '10px 6px', textAlign: 'center',
            ...FS.type.h3, fontSize: 15,
            background: i === 2 ? FS.color.plum : 'transparent',
            color: i === 2 ? FS.color.paper : FS.color.ink,
            border: `1px solid ${i === 2 ? FS.color.plum : FS.color.rule}`,
            cursor: 'pointer',
          }}>{t}</div>
        ))}
      </div>
    </IntakeShell>
  );
}

// 09 Confirm
function S_Confirm() {
  return (
    <div style={{ height: '100%', background: FS.color.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FS.StatusBar/>
      <FS.AppHeader step={9} total={9}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 120px' }}>
        <FS.Masthead eyebrow="You're booked." title="See you" accent="Tuesday." right="CONF #4281"/>
        <div style={{ ...FS.type.editorial, color: FS.color.softInk, marginTop: 20, marginBottom: 20 }}>
          A confirmation and prep notes are on their way.
        </div>
        <FS.SummaryRow label="When" value="Tue, Jun 18 · 2:00p"/>
        <FS.SummaryRow label="With" value="Nadia Rivera"/>
        <FS.SummaryRow label="Service" value="Partial highlights + cut"/>
        <FS.SummaryRow label="Estimate" value="$245 · 3h 15m"/>
        <FS.SummaryRow label="Deposit" value="$50 held"/>
        <div style={{ marginTop: 20 }}>
          <FS.Note tone="success">Deposit received. Cancellations inside 24h forfeit deposit.</FS.Note>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 22px', background: FS.color.paper, borderTop: `1px solid ${FS.color.rule}`, display: 'flex', gap: 10 }}>
        <FS.Button variant="secondary">Add to calendar</FS.Button>
        <FS.Button variant="primary" size="lg" style={{ flex: 1 }}>Done</FS.Button>
      </div>
      <FS.HomeIndicator/>
    </div>
  );
}

Object.assign(window, { S_Service, S_Color, S_Extensions, S_Photos, S_History, S_Budget, S_Estimate, S_Booking, S_Confirm });
