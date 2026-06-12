// Stylist-side dashboard — mobile only, 2 variants
// A) Standard: white/cream w/ coral accents, list of appts
// B) Bold:     butter hero + ink cards, dense list

const { FS: FS_S } = window;

const APPTS = [
  { time: '9:00a',   dur: '45m', client: 'Priya R.',    service: 'Cut + blow-dry',                 level: 'L4 → L4',   tag: 'REGULAR',    note: 'Asked for 2in off ends, keep layers.' },
  { time: '10:30a',  dur: '2h',  client: 'Mia Chen',    service: 'Partial highlights + cut',       level: 'L7 → L8',   tag: 'NEW',        note: 'Wants lived-in blonde, no brassy tones.' },
  { time: '1:00p',   dur: '3h 15m', client: 'Sasha V.', service: 'Full balayage + gloss',          level: 'L6 → L9',   tag: 'VIP',        note: 'Celebrating anniversary. Champagne ok.' },
  { time: '4:45p',   dur: '1h',  client: 'Teo H.',      service: 'Root touch-up',                  level: 'L3 → L3',   tag: 'REGULAR',    note: 'Running late last 2 visits.' },
  { time: '6:15p',   dur: '45m', client: 'Elena S.',    service: 'Bang trim + consult',            level: '—',         tag: 'CONSULT',    note: 'Considering bob cut. Bring reference book.' },
];

// ─── Shared chrome ────────────────────────────────────────────────
function StylistShell({ bg, children, tab = 'Today', noTab }) {
  return (
    <div style={{ height: '100%', background: bg || FS_S.color.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FS_S.StatusBar/>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: noTab ? 20 : 80 }}>
        {children}
      </div>
      {!noTab && <StylistTabBar active={tab}/>}
      <FS_S.HomeIndicator/>
    </div>
  );
}

function StylistTabBar({ active = 'Today' }) {
  const tabs = [
    { k: 'Today',   ic: '▤' },
    { k: 'Clients', ic: '◎' },
    { k: 'Inbox',   ic: '✉', badge: 3 },
    { k: 'You',     ic: '◉' },
  ].map(t => ({ ...t, on: t.k === active }));
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: FS_S.color.paper, borderTop: `1px solid ${FS_S.color.rule}`,
      display: 'flex', paddingBottom: 14,
    }}>
      {tabs.map(t => (
        <div key={t.k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}>
          <div style={{ ...FS_S.type.h3, fontSize: 16, color: t.on ? FS_S.color.ink : FS_S.color.soft }}>{t.ic}</div>
          <div style={{ ...FS_S.type.meta, fontSize: 9, letterSpacing: 1.2, color: t.on ? FS_S.color.ink : FS_S.color.soft }}>{t.k.toUpperCase()}</div>
          {t.badge && <div style={{
            position: 'absolute', top: 10, right: 'calc(50% - 18px)',
            width: 16, height: 16, borderRadius: 999, background: FS_S.color.coral,
            color: FS_S.color.paper, ...FS_S.type.meta, fontSize: 9, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{t.badge}</div>}
        </div>
      ))}
    </div>
  );
}

// Small colored swatch pair for L7→L8 etc
function LevelBar({ from, to, size = 18, accent }) {
  if (from === '—') return <div style={{ ...FS_S.type.meta, color: FS_S.color.soft }}>No color today</div>;
  const hues = {
    L3: '#3d2a1e', L4: '#5a3e2a', L5: '#7a5638', L6: '#9b7547',
    L7: '#b89461', L8: '#d1b283', L9: '#e2ce9e', L10: '#ead9af',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: size, height: size, background: hues[from.replace('L','L')] || FS_S.color.soft, borderRadius: 2, border: `1px solid ${FS_S.color.rule}` }}/>
      <div style={{ ...FS_S.type.meta, color: accent || FS_S.color.soft, fontSize: 11 }}>{from} → {to}</div>
      <div style={{ width: size, height: size, background: hues[to.replace('L','L')] || FS_S.color.soft, borderRadius: 2, border: `1px solid ${FS_S.color.rule}` }}/>
    </div>
  );
}

// ─── VARIANT A — Standard (Coral accents) ─────────────────────────
function St_Today_Standard() {
  const accent = FS_S.color.coral;
  return (
    <StylistShell>
      {/* Top ribbon */}
      <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FS_S.Wordmark size={16}/>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: FS_S.color.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_S.type.h3, fontSize: 13, color: FS_S.color.plum }}>N</div>
      </div>

      {/* Hero: date + quick stats */}
      <div style={{ padding: '8px 22px 20px' }}>
        <FS_S.Eyebrow style={{ marginBottom: 8 }}>TUE · JUN 18 · TODAY</FS_S.Eyebrow>
        <div style={{ ...FS_S.type.display3, fontSize: 44, color: FS_S.color.ink, letterSpacing: -0.5, lineHeight: 0.95 }}>
          Five in<br/>the chair.
        </div>
        <div style={{ ...FS_S.type.editorial, color: FS_S.color.softInk, fontSize: 17, marginTop: 10 }}>
          First cut at 9. Out by 7:15.
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
          <div style={{ padding: '12px 14px', background: FS_S.color.cream }}>
            <FS_S.Eyebrow color={accent} style={{ fontSize: 9 }}>BOOKED</FS_S.Eyebrow>
            <div style={{ ...FS_S.type.h2, fontSize: 22, marginTop: 4 }}>5 / 6</div>
          </div>
          <div style={{ padding: '12px 14px', background: FS_S.color.cream }}>
            <FS_S.Eyebrow color={accent} style={{ fontSize: 9 }}>CHAIR TIME</FS_S.Eyebrow>
            <div style={{ ...FS_S.type.h2, fontSize: 22, marginTop: 4 }}>7h 45m</div>
          </div>
          <div style={{ padding: '12px 14px', background: FS_S.color.cream }}>
            <FS_S.Eyebrow color={accent} style={{ fontSize: 9 }}>EST · $</FS_S.Eyebrow>
            <div style={{ ...FS_S.type.h2, fontSize: 22, marginTop: 4 }}>$1,290</div>
          </div>
        </div>
      </div>

      {/* Up next highlight */}
      <div style={{ margin: '0 22px 22px', padding: '16px 18px', background: accent, color: FS_S.color.paper }}>
        <FS_S.Eyebrow color="rgba(255,255,255,0.8)" style={{ fontSize: 9 }}>UP NEXT · IN 12 MIN</FS_S.Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          <div>
            <div style={{ ...FS_S.type.h2, color: FS_S.color.paper, fontSize: 26 }}>Mia Chen</div>
            <div style={{ ...FS_S.type.editorial, color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 2 }}>
              Partial highlights + cut
            </div>
          </div>
          <div style={{ ...FS_S.type.display3, fontSize: 30, color: FS_S.color.paper }}>10:30</div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LevelBar from="L7" to="L8" accent="rgba(255,255,255,0.9)"/>
          <div style={{ ...FS_S.type.meta, color: FS_S.color.paper }}>REVIEW BRIEF →</div>
        </div>
      </div>

      {/* Schedule list */}
      <div style={{ padding: '0 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <FS_S.Eyebrow>TODAY · 5 APPOINTMENTS</FS_S.Eyebrow>
          <div style={{ ...FS_S.type.meta, color: FS_S.color.soft }}>SORT: TIME</div>
        </div>

        {APPTS.map((a, i) => {
          const isNext = a.client === 'Mia Chen';
          return (
            <div key={a.time} style={{
              padding: '16px 0', borderTop: `1px solid ${FS_S.color.rule}`,
              display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 14, alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ ...FS_S.type.h2, fontSize: 20, color: FS_S.color.ink }}>{a.time}</div>
                <div style={{ ...FS_S.type.meta, color: FS_S.color.soft, marginTop: 2, fontSize: 10 }}>{a.dur.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ ...FS_S.type.h3, fontSize: 16, color: FS_S.color.ink }}>{a.client}</div>
                  <div style={{
                    ...FS_S.type.meta, fontSize: 9, letterSpacing: 1.2,
                    padding: '2px 6px',
                    background: a.tag === 'VIP' ? accent : a.tag === 'NEW' ? FS_S.color.butter : FS_S.color.cream,
                    color: a.tag === 'VIP' ? FS_S.color.paper : FS_S.color.ink,
                  }}>{a.tag}</div>
                </div>
                <div style={{ ...FS_S.type.editorial, color: FS_S.color.softInk, fontSize: 15 }}>
                  {a.service}
                </div>
                <div style={{ marginTop: 6 }}>
                  <LevelBar from={a.level.split(' → ')[0]} to={a.level.split(' → ')[1] || a.level.split(' → ')[0]} size={12}/>
                </div>
                <div style={{ ...FS_S.type.bodySm, color: FS_S.color.soft, marginTop: 6, fontStyle: 'italic' }}>
                  "{a.note}"
                </div>
              </div>
              <div style={{ ...FS_S.type.meta, color: accent, fontSize: 16 }}>›</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0 22px' }}>
        <FS_S.Note tone="info">
          Gap from 3:00–3:45. Offer as a walk-in window?
        </FS_S.Note>
      </div>
    </StylistShell>
  );
}

// ─── VARIANT B — Bold (Butter hero, full-bleed cards) ─────────────
function St_Today_Bold() {
  return (
    <StylistShell bg={FS_S.color.ink}>
      {/* Butter hero block */}
      <div style={{ background: FS_S.color.butter, padding: '16px 22px 28px', color: FS_S.color.ink }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <FS_S.Wordmark size={16}/>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ ...FS_S.type.meta, color: FS_S.color.plumDeep }}>NADIA · SENIOR</div>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: FS_S.color.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_S.type.h3, fontSize: 12, color: FS_S.color.butter }}>N</div>
          </div>
        </div>
        <FS_S.Eyebrow color={FS_S.color.plumDeep} style={{ marginBottom: 6 }}>TUE · JUN 18</FS_S.Eyebrow>
        <div style={{ ...FS_S.type.display1, fontSize: 96, color: FS_S.color.ink, letterSpacing: -2, lineHeight: 0.82 }}>
          Today.
        </div>
        <div style={{ ...FS_S.type.editorialLg, fontSize: 22, color: FS_S.color.plumDeep, marginTop: 8 }}>
          5 in, 7¾ hours in the chair, about $1,290 in.
        </div>

        {/* Stat strip */}
        <div style={{ display: 'flex', gap: 16, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${FS_S.color.ink}` }}>
          {[
            { k: 'BOOKED', v: '5/6' },
            { k: 'CHAIR',  v: '7h 45m' },
            { k: 'EST $',  v: '$1,290' },
            { k: 'TIPS',   v: '+ ~$220' },
          ].map((s, i) => (
            <div key={s.k} style={{ flex: 1, borderLeft: i === 0 ? 'none' : `1px solid ${FS_S.color.ink}`, paddingLeft: i === 0 ? 0 : 12 }}>
              <div style={{ ...FS_S.type.meta, fontSize: 9, color: FS_S.color.plumDeep }}>{s.k}</div>
              <div style={{ ...FS_S.type.h2, fontSize: 20, marginTop: 3 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* "Up next" — coral bar */}
      <div style={{ padding: '16px 22px', background: FS_S.color.coral, color: FS_S.color.paper, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 8, height: 40, background: FS_S.color.paper }}/>
        <div style={{ flex: 1 }}>
          <div style={{ ...FS_S.type.meta, color: 'rgba(255,255,255,0.85)', fontSize: 9 }}>UP NEXT · IN 12 MIN</div>
          <div style={{ ...FS_S.type.h2, color: FS_S.color.paper, fontSize: 18, marginTop: 2 }}>Mia Chen · Partial + cut</div>
        </div>
        <div style={{ ...FS_S.type.display3, fontSize: 22, color: FS_S.color.paper }}>10:30</div>
      </div>

      {/* Schedule — dark cards */}
      <div style={{ padding: '20px 22px 22px' }}>
        <FS_S.Eyebrow color={FS_S.color.butter} style={{ marginBottom: 14 }}>TODAY'S LIST</FS_S.Eyebrow>

        {APPTS.map((a, i) => {
          const isNext = a.client === 'Mia Chen';
          return (
            <div key={a.time} style={{
              marginBottom: 10, padding: '14px 16px',
              background: isNext ? FS_S.color.coral : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isNext ? FS_S.color.coral : 'rgba(255,255,255,0.1)'}`,
              display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 12, alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ ...FS_S.type.h2, fontSize: 18, color: FS_S.color.paper }}>{a.time}</div>
                <div style={{ ...FS_S.type.meta, fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{a.dur.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ ...FS_S.type.h3, fontSize: 15, color: FS_S.color.paper }}>{a.client}</div>
                  <div style={{
                    ...FS_S.type.meta, fontSize: 9, letterSpacing: 1.2, padding: '2px 6px',
                    background: a.tag === 'VIP' ? FS_S.color.butter : a.tag === 'NEW' ? FS_S.color.butter : 'rgba(255,255,255,0.15)',
                    color: a.tag === 'VIP' || a.tag === 'NEW' ? FS_S.color.ink : FS_S.color.paper,
                  }}>{a.tag}</div>
                </div>
                <div style={{ ...FS_S.type.editorial, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                  {a.service}
                </div>
                {a.level !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <LevelBar from={a.level.split(' → ')[0]} to={a.level.split(' → ')[1] || a.level.split(' → ')[0]} size={11} accent={isNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)'}/>
                  </div>
                )}
              </div>
              <div style={{ ...FS_S.type.meta, color: FS_S.color.butter, fontSize: 16 }}>›</div>
            </div>
          );
        })}

        <div style={{ marginTop: 18, padding: '14px 16px', border: `1px dashed rgba(255,255,255,0.25)`, textAlign: 'center' }}>
          <div style={{ ...FS_S.type.meta, fontSize: 10, color: FS_S.color.butter }}>OPEN · 3:00 – 3:45</div>
          <div style={{ ...FS_S.type.editorial, fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
            Offer as a walk-in window?
          </div>
        </div>
      </div>
    </StylistShell>
  );
}

// Tabbar needs dark-mode awareness — override when bg is ink
function St_Today_Bold_Wrapper() {
  // The shared StylistTabBar uses paper bg. For the Bold variant we want
  // it to sit on a dark shell but still be light (common pattern).
  return <St_Today_Bold/>;
}

Object.assign(window, { St_Today_Standard, St_Today_Bold });
