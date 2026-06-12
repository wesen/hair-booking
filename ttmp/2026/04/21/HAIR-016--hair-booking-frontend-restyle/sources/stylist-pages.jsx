// Stylist dashboard — additional pages (Standard variant, coral accent)
// Clients list, Client detail (intake brief), Inbox, Thread, You (profile)

const { FS: FS_P } = window;
const ACCENT = FS_P.color.coral;

// Local copy of shared chrome to avoid coupling to stylist-dashboard.jsx internals.
// (Tab bar is identical in spirit; we reuse StylistShell from the other file.)

// ─── Reusable bits ────────────────────────────────────────────────
function PageHeader({ eyebrow, title, right }) {
  return (
    <div style={{ padding: '14px 22px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <FS_P.Wordmark size={16}/>
        {right}
      </div>
      <FS_P.Eyebrow style={{ marginBottom: 6 }}>{eyebrow}</FS_P.Eyebrow>
      <div style={{ ...FS_P.type.display3, fontSize: 40, color: FS_P.color.ink, letterSpacing: -0.4, lineHeight: 0.95 }}>
        {title}
      </div>
    </div>
  );
}

function Avatar({ name, size = 40, bg = FS_P.color.peach, color = FS_P.color.plum }) {
  const initial = (name || '?')[0];
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_P.type.h3, fontSize: size * 0.4, color, flexShrink: 0 }}>
      {initial}
    </div>
  );
}

function Tag({ children, tone = 'neutral' }) {
  const palette = {
    vip:     { bg: ACCENT, fg: FS_P.color.paper },
    new:     { bg: FS_P.color.butter, fg: FS_P.color.ink },
    regular: { bg: FS_P.color.cream, fg: FS_P.color.ink },
    consult: { bg: FS_P.color.sage, fg: FS_P.color.paper },
    neutral: { bg: FS_P.color.cream, fg: FS_P.color.ink },
  };
  const p = palette[tone] || palette.neutral;
  return (
    <div style={{ ...FS_P.type.meta, fontSize: 9, letterSpacing: 1.2, padding: '2px 6px', background: p.bg, color: p.fg, display: 'inline-block' }}>
      {children}
    </div>
  );
}

// ─── CLIENTS · LIST ───────────────────────────────────────────────
function St_Clients() {
  const CLIENTS = [
    { n: 'Mia Chen',     last: 'Today · 10:30a',  svc: 'Partial + cut',          tag: 'new',     lvl: 'L7', note: 'First-timer · lived-in blonde', visits: 1 },
    { n: 'Sasha V.',     last: 'Today · 1:00p',   svc: 'Full balayage',          tag: 'vip',     lvl: 'L6', note: 'Anniversary look', visits: 18 },
    { n: 'Priya R.',     last: 'Today · 9:00a',   svc: 'Cut + blow-dry',         tag: 'regular', lvl: 'L4', note: '—', visits: 7 },
    { n: 'Elena S.',     last: 'Today · 6:15p',   svc: 'Consult',                tag: 'consult', lvl: '—',  note: 'Considering bob', visits: 0 },
    { n: 'Teo H.',       last: 'Today · 4:45p',   svc: 'Root touch-up',          tag: 'regular', lvl: 'L3', note: 'Runs late', visits: 4 },
    { n: 'Josephine L.', last: '3 weeks ago',     svc: 'Gloss + trim',           tag: 'regular', lvl: 'L5', note: '—', visits: 12 },
    { n: 'Ingrid M.',    last: '6 weeks ago',     svc: 'Full color',             tag: 'regular', lvl: 'L4', note: 'Allergic to PPD', visits: 9 },
    { n: 'Kai R.',       last: '2 months ago',    svc: 'Cut',                    tag: 'regular', lvl: 'L2', note: '—', visits: 5 },
    { n: 'Nora B.',      last: '3 months ago',    svc: 'Balayage',               tag: 'regular', lvl: 'L7', note: 'Due for gloss', visits: 6 },
  ];

  return (
    <StylistShell tab="Clients">
      <PageHeader
        eyebrow="ROSTER · 142 ACTIVE"
        title={<>Your<br/>clients.</>}
        right={<div style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${FS_P.color.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_P.type.h3, fontSize: 14 }}>+</div>}
      />

      {/* Search */}
      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ padding: '12px 14px', background: FS_P.color.cream, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...FS_P.type.meta, color: FS_P.color.soft }}>⌕</div>
          <div style={{ ...FS_P.type.editorial, color: FS_P.color.soft, fontSize: 15 }}>Search name, service, notes…</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 22px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['All', 'Today', 'This week', 'VIPs', 'Overdue', 'New'].map((f, i) => (
          <FS_P.Chip key={f} selected={i === 0}>{f}</FS_P.Chip>
        ))}
      </div>

      {/* Grouped list */}
      <div style={{ padding: '0 22px' }}>
        <div style={{ padding: '8px 0 6px' }}>
          <FS_P.Eyebrow color={ACCENT}>TODAY · 5</FS_P.Eyebrow>
        </div>
        {CLIENTS.slice(0, 5).map(c => <ClientRow key={c.n} c={c}/>)}

        <div style={{ padding: '18px 0 6px' }}>
          <FS_P.Eyebrow>DUE SOON · 4</FS_P.Eyebrow>
        </div>
        {CLIENTS.slice(5).map(c => <ClientRow key={c.n} c={c}/>)}
      </div>
    </StylistShell>
  );
}

function ClientRow({ c }) {
  return (
    <div style={{
      padding: '12px 0', borderTop: `1px solid ${FS_P.color.rule}`,
      display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, alignItems: 'center',
    }}>
      <Avatar name={c.n}/>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ ...FS_P.type.h3, fontSize: 15 }}>{c.n}</div>
          {c.tag !== 'regular' && <Tag tone={c.tag}>{c.tag.toUpperCase()}</Tag>}
        </div>
        <div style={{ ...FS_P.type.editorial, color: FS_P.color.softInk, fontSize: 14 }}>
          {c.svc} · {c.lvl}
        </div>
        <div style={{ ...FS_P.type.meta, color: FS_P.color.soft, marginTop: 3 }}>
          {c.last.toUpperCase()} · {c.visits} VISITS
        </div>
      </div>
      <div style={{ ...FS_P.type.meta, color: ACCENT, fontSize: 16 }}>›</div>
    </div>
  );
}

// ─── CLIENT · DETAIL (intake brief for Mia Chen) ──────────────────
function St_ClientDetail() {
  return (
    <StylistShell tab="Clients">
      {/* Top bar with back */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...FS_P.type.meta, color: ACCENT, fontSize: 11 }}>‹ CLIENTS</div>
        <div style={{ ...FS_P.type.meta, color: FS_P.color.soft }}>EDIT</div>
      </div>

      {/* Hero: avatar + name */}
      <div style={{ padding: '20px 22px 18px', display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <Avatar name="Mia Chen" size={72} bg={FS_P.color.peach}/>
        <div style={{ flex: 1, paddingBottom: 4 }}>
          <Tag tone="new">NEW</Tag>
          <div style={{ ...FS_P.type.display3, fontSize: 34, color: FS_P.color.ink, letterSpacing: -0.3, lineHeight: 0.95, marginTop: 6 }}>
            Mia Chen
          </div>
          <div style={{ ...FS_P.type.editorial, color: FS_P.color.softInk, fontSize: 15, marginTop: 2 }}>
            First visit · today 10:30a
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ margin: '0 22px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { k: 'VISITS',     v: '1st'   },
          { k: 'LAST SEEN',  v: '—'     },
          { k: 'BUDGET',     v: '$220–$280' },
        ].map(s => (
          <div key={s.k} style={{ padding: '10px 12px', background: FS_P.color.cream }}>
            <FS_P.Eyebrow color={ACCENT} style={{ fontSize: 9 }}>{s.k}</FS_P.Eyebrow>
            <div style={{ ...FS_P.type.h3, fontSize: 14, marginTop: 4 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Color level — hero */}
      <div style={{ padding: '0 22px 18px' }}>
        <FS_P.Eyebrow style={{ marginBottom: 10 }}>01 — COLOR · CURRENT → TARGET</FS_P.Eyebrow>
        <div style={{ padding: '18px 18px', background: FS_P.color.cream, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#b89461', border: `1px solid ${FS_P.color.rule}`, marginBottom: 6 }}/>
            <div style={{ ...FS_P.type.meta, color: FS_P.color.ink }}>LEVEL 7</div>
            <div style={{ ...FS_P.type.editorial, color: FS_P.color.soft, fontSize: 11 }}>dark blonde · warm</div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
            <div style={{ ...FS_P.type.h2, fontSize: 22, color: ACCENT }}>→</div>
            <div style={{ ...FS_P.type.meta, color: FS_P.color.soft, fontSize: 9 }}>+1 LEVEL</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#d1b283', border: `1px solid ${FS_P.color.rule}`, marginBottom: 6 }}/>
            <div style={{ ...FS_P.type.meta, color: FS_P.color.ink }}>LEVEL 8</div>
            <div style={{ ...FS_P.type.editorial, color: FS_P.color.soft, fontSize: 11 }}>lived-in · cool</div>
          </div>
        </div>
        <div style={{ ...FS_P.type.editorial, color: FS_P.color.softInk, fontSize: 15, marginTop: 10, fontStyle: 'italic' }}>
          "Lived-in blonde, no brassy tones. Face-framing pieces."
        </div>
      </div>

      {/* Service + condition */}
      <div style={{ padding: '16px 22px', borderTop: `1px solid ${FS_P.color.rule}` }}>
        <FS_P.Eyebrow style={{ marginBottom: 10 }}>02 — SERVICE</FS_P.Eyebrow>
        <div style={{ ...FS_P.type.h2, fontSize: 19 }}>Partial highlights + cut</div>
        <div style={{ ...FS_P.type.editorial, color: FS_P.color.softInk, fontSize: 14, marginTop: 4 }}>
          2h · est. $245 · includes Olaplex ($45)
        </div>
      </div>

      <div style={{ padding: '16px 22px', borderTop: `1px solid ${FS_P.color.rule}` }}>
        <FS_P.Eyebrow style={{ marginBottom: 12 }}>03 — CONDITION</FS_P.Eyebrow>
        <FS_P.RatingBar label="Breakage" value={2}/>
        <FS_P.RatingBar label="Split ends" value={3}/>
        <FS_P.RatingBar label="Dryness" value={1}/>
        <FS_P.RatingBar label="Frizz" value={3}/>
      </div>

      {/* Photos */}
      <div style={{ padding: '16px 22px', borderTop: `1px solid ${FS_P.color.rule}` }}>
        <FS_P.Eyebrow style={{ marginBottom: 10 }}>04 — PHOTOS</FS_P.Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['Current', 'Current', 'Inspo'].map((l, i) => (
            <div key={i} style={{ aspectRatio: '1', background: FS_P.color.peachSoft, display: 'flex', alignItems: 'flex-end', padding: 8 }}>
              <div style={{ ...FS_P.type.meta, fontSize: 9, color: FS_P.color.plum }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stylist note */}
      <div style={{ padding: '16px 22px 20px', borderTop: `1px solid ${FS_P.color.rule}` }}>
        <FS_P.Eyebrow style={{ marginBottom: 10 }}>05 — YOUR NOTES</FS_P.Eyebrow>
        <div style={{ padding: '12px 14px', background: FS_P.color.cream, ...FS_P.type.editorial, fontSize: 15, color: FS_P.color.softInk, minHeight: 70 }}>
          Tap to add a formula, process notes, or reminders for next visit…
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 22px 20px', display: 'flex', gap: 10 }}>
        <FS_P.Button variant="secondary" style={{ flex: 1 }}>Message</FS_P.Button>
        <FS_P.Button variant="primary" size="lg" style={{ flex: 1, background: ACCENT }}>Start session →</FS_P.Button>
      </div>
    </StylistShell>
  );
}

// ─── INBOX ────────────────────────────────────────────────────────
function St_Inbox() {
  const threads = [
    { n: 'Mia Chen',     t: '12m',  p: 'Running 5 min late, sorry!',               unread: true,  tag: 'new' },
    { n: 'Sasha V.',     t: '1h',   p: 'Can I bring a plus-one to watch?',         unread: true,  tag: 'vip' },
    { n: 'Elena S.',     t: '3h',   p: 'Attached the two bob refs we discussed.', unread: true,  tag: 'consult' },
    { n: 'Priya R.',     t: 'Yest', p: 'Booked — see you Tuesday. 🤍',             unread: false, tag: 'regular' },
    { n: 'Teo H.',       t: 'Mon',  p: 'Need to push 15m later, traffic.',        unread: false, tag: 'regular' },
    { n: 'Josephine L.', t: 'Jun 4',p: 'Gloss faded faster than expected…',       unread: false, tag: 'regular' },
    { n: 'Ingrid M.',    t: 'Jun 1',p: 'Thanks again, the color is perfect.',     unread: false, tag: 'regular' },
  ];
  return (
    <StylistShell tab="Inbox">
      <PageHeader
        eyebrow="3 UNREAD · 7 TOTAL"
        title={<>Inbox.</>}
        right={<div style={{ ...FS_P.type.meta, color: ACCENT }}>MARK ALL READ</div>}
      />

      {/* Filter */}
      <div style={{ padding: '0 22px 14px', display: 'flex', gap: 6 }}>
        {['All', 'Unread', 'Today', 'Consults'].map((f, i) => (
          <FS_P.Chip key={f} selected={i === 0}>{f}</FS_P.Chip>
        ))}
      </div>

      <div style={{ padding: '0 22px' }}>
        {threads.map(t => (
          <div key={t.n} style={{
            padding: '14px 0', borderTop: `1px solid ${FS_P.color.rule}`,
            display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={t.n}/>
              {t.unread && <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 999, background: ACCENT, border: `2px solid ${FS_P.color.paper}` }}/>}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                <div style={{ ...FS_P.type.h3, fontSize: 15, color: FS_P.color.ink }}>{t.n}</div>
                {t.tag !== 'regular' && <Tag tone={t.tag}>{t.tag.toUpperCase()}</Tag>}
              </div>
              <div style={{ ...FS_P.type.editorial, fontSize: 15, color: t.unread ? FS_P.color.ink : FS_P.color.softInk, fontStyle: t.unread ? 'normal' : 'italic', fontFamily: t.unread ? FS_P.font.sans : FS_P.font.serif }}>
                {t.p}
              </div>
            </div>
            <div style={{ ...FS_P.type.meta, color: FS_P.color.soft, fontSize: 10 }}>{t.t.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </StylistShell>
  );
}

// ─── INBOX · THREAD ───────────────────────────────────────────────
function St_Thread() {
  const msgs = [
    { who: 'them', t: '9:42a', text: 'Hi Nadia! Quick question — can I still bring those reference photos we looked at?' },
    { who: 'me',   t: '9:58a', text: 'Of course. Bring as many as you want, the more angles the better.' },
    { who: 'them', t: '10:04a', text: 'Perfect. Also — running 5 min late, sorry!' },
    { who: 'me',   t: '10:05a', text: 'All good, take your time. I just pulled your intake and the color plan is ready.' },
    { who: 'them', t: '10:18a', text: 'You\'re the best 🤍' },
  ];
  return (
    <StylistShell tab="Inbox" noTab>
      {/* Thread header */}
      <div style={{ padding: '12px 22px 14px', borderBottom: `1px solid ${FS_P.color.rule}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...FS_P.type.meta, color: ACCENT, fontSize: 11 }}>‹</div>
        <Avatar name="Mia Chen" size={34}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...FS_P.type.h3, fontSize: 15 }}>Mia Chen</div>
            <Tag tone="new">NEW</Tag>
          </div>
          <div style={{ ...FS_P.type.meta, color: FS_P.color.soft, marginTop: 2 }}>TODAY · 10:30A</div>
        </div>
        <div style={{ ...FS_P.type.meta, color: ACCENT, fontSize: 16 }}>◎</div>
      </div>

      {/* Context banner */}
      <div style={{ margin: '14px 22px', padding: '12px 14px', background: FS_P.color.cream, borderLeft: `3px solid ${ACCENT}` }}>
        <FS_P.Eyebrow color={ACCENT} style={{ fontSize: 9 }}>UPCOMING · IN 12 MIN</FS_P.Eyebrow>
        <div style={{ ...FS_P.type.h3, fontSize: 14, marginTop: 4 }}>Partial highlights + cut · $245</div>
      </div>

      {/* Messages */}
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '10px 14px',
                background: m.who === 'me' ? ACCENT : FS_P.color.cream,
                color: m.who === 'me' ? FS_P.color.paper : FS_P.color.ink,
                ...FS_P.type.bodyLg, fontSize: 15, lineHeight: 1.4,
              }}>{m.text}</div>
              <div style={{ ...FS_P.type.meta, color: FS_P.color.soft, fontSize: 9, marginTop: 4, textAlign: m.who === 'me' ? 'right' : 'left' }}>
                {m.t.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 24px', background: FS_P.color.paper, borderTop: `1px solid ${FS_P.color.rule}`,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ width: 34, height: 34, border: `1px solid ${FS_P.color.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_P.type.h3, fontSize: 16, color: FS_P.color.softInk }}>+</div>
        <div style={{ flex: 1, padding: '10px 14px', background: FS_P.color.cream, ...FS_P.type.editorial, color: FS_P.color.soft, fontSize: 15 }}>Message Mia…</div>
        <div style={{ ...FS_P.type.h3, fontSize: 13, color: ACCENT, padding: '0 6px' }}>SEND</div>
      </div>
    </StylistShell>
  );
}

// ─── YOU · PROFILE ────────────────────────────────────────────────
function St_You() {
  const nav = [
    { g: 'Business',  items: [
      { k: 'Services & pricing',   v: '12 services', arrow: true },
      { k: 'Availability',         v: 'Tue–Sat · 9a–7p', arrow: true },
      { k: 'Payouts',              v: '$4,820 pending', arrow: true, accent: true },
    ] },
    { g: 'Your page', items: [
      { k: 'Portfolio',            v: '24 photos', arrow: true },
      { k: 'Bio & specialties',    v: 'Lived-in blonde, balayage', arrow: true },
      { k: 'Reviews',              v: '4.9 ★ · 320 reviews', arrow: true },
    ] },
    { g: 'App',      items: [
      { k: 'Notifications',        v: 'All on', arrow: true },
      { k: 'Language',             v: 'English', arrow: true },
      { k: 'Help & support',       v: '', arrow: true },
      { k: 'Sign out',             v: '', arrow: false, danger: true },
    ] },
  ];
  return (
    <StylistShell tab="You">
      <PageHeader
        eyebrow="PROFILE"
        title={<>You.</>}
      />

      {/* Big profile card */}
      <div style={{ margin: '0 22px 20px', padding: '20px 20px', background: FS_P.color.cream, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar name="Nadia" size={64} bg={ACCENT} color={FS_P.color.paper}/>
        <div style={{ flex: 1 }}>
          <div style={{ ...FS_P.type.h2, fontSize: 22 }}>Nadia Rivera</div>
          <div style={{ ...FS_P.type.editorial, color: FS_P.color.softInk, fontSize: 15, marginTop: 2 }}>
            Senior colorist · Fringe West Loop
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 10 }}>
            <Tag tone="vip">TOP 1%</Tag>
            <div style={{ ...FS_P.type.meta, color: FS_P.color.soft }}>SINCE 2021</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '0 22px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { k: 'RATING',   v: '4.9', sub: '320 reviews' },
            { k: 'THIS WK',  v: '$3.1k', sub: '18 booked' },
            { k: 'REBOOK',   v: '84%', sub: 'last 90 days' },
          ].map((s, i) => (
            <div key={s.k} style={{
              padding: '14px 12px', textAlign: 'center',
              borderLeft: i === 0 ? 'none' : `1px solid ${FS_P.color.rule}`,
            }}>
              <FS_P.Eyebrow color={ACCENT} style={{ fontSize: 9 }}>{s.k}</FS_P.Eyebrow>
              <div style={{ ...FS_P.type.display3, fontSize: 26, marginTop: 4, color: FS_P.color.ink }}>{s.v}</div>
              <div style={{ ...FS_P.type.editorial, color: FS_P.color.soft, fontSize: 12, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav groups */}
      {nav.map(g => (
        <div key={g.g} style={{ padding: '0 22px 14px' }}>
          <FS_P.Eyebrow style={{ marginBottom: 8 }}>{g.g.toUpperCase()}</FS_P.Eyebrow>
          {g.items.map((it, i) => (
            <div key={it.k} style={{
              padding: '14px 0', borderTop: `1px solid ${FS_P.color.rule}`,
              display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between',
            }}>
              <div style={{ ...FS_P.type.h3, fontSize: 14, color: it.danger ? ACCENT : FS_P.color.ink }}>
                {it.k}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {it.v && <div style={{ ...FS_P.type.editorial, color: it.accent ? ACCENT : FS_P.color.soft, fontSize: 14 }}>{it.v}</div>}
                {it.arrow && <div style={{ ...FS_P.type.meta, color: FS_P.color.soft }}>›</div>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ padding: '12px 22px 28px', ...FS_P.type.meta, color: FS_P.color.soft, textAlign: 'center' }}>
        FRINGE · v2.4.1
      </div>
    </StylistShell>
  );
}

Object.assign(window, { St_Clients, St_ClientDetail, St_Inbox, St_Thread, St_You });
