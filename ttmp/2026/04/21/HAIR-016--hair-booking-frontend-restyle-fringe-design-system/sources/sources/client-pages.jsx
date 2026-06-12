// Client-side pages — mobile, minimal. Manages past bookings + account.
// Pages: Landing (home), Upcoming detail, History, Account.

const { FS: FS_C } = window;

// ─── Shared chrome ────────────────────────────────────────────────
function ClientShell({ children, tab = 'Home', noTab }) {
  return (
    <div style={{ height: '100%', background: FS_C.color.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FS_C.StatusBar/>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: noTab ? 20 : 80 }}>
        {children}
      </div>
      {!noTab && <ClientTabBar active={tab}/>}
      <FS_C.HomeIndicator/>
    </div>
  );
}

function ClientTabBar({ active }) {
  const tabs = [
    { k: 'Home',    ic: '▤' },
    { k: 'Book',    ic: '＋' },
    { k: 'History', ic: '◷' },
    { k: 'Account', ic: '◉' },
  ].map(t => ({ ...t, on: t.k === active }));
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: FS_C.color.paper, borderTop: `1px solid ${FS_C.color.rule}`,
      display: 'flex', paddingBottom: 14,
    }}>
      {tabs.map(t => (
        <div key={t.k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ ...FS_C.type.h3, fontSize: 16, color: t.on ? FS_C.color.ink : FS_C.color.soft }}>{t.ic}</div>
          <div style={{ ...FS_C.type.meta, fontSize: 9, letterSpacing: 1.2, color: t.on ? FS_C.color.ink : FS_C.color.soft }}>{t.k.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

// ─── LANDING · Home ───────────────────────────────────────────────
function C_Landing() {
  return (
    <ClientShell tab="Home">
      {/* Top */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FS_C.Wordmark size={16}/>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: FS_C.color.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_C.type.h3, fontSize: 13, color: FS_C.color.plum }}>M</div>
      </div>

      {/* Peach masthead */}
      <div style={{ margin: '18px 22px 22px', background: FS_C.color.peach, padding: '22px 22px 24px' }}>
        <FS_C.Eyebrow color={FS_C.color.plumDeep} style={{ marginBottom: 6 }}>GOOD MORNING · MIA</FS_C.Eyebrow>
        <div style={{ ...FS_C.type.display3, fontSize: 36, color: FS_C.color.ink, letterSpacing: -0.3, lineHeight: 0.95 }}>
          Two days<br/>until the chair.
        </div>
      </div>

      {/* Upcoming card */}
      <div style={{ padding: '0 22px 22px' }}>
        <FS_C.Eyebrow style={{ marginBottom: 10 }}>UPCOMING</FS_C.Eyebrow>
        <div style={{ border: `1px solid ${FS_C.color.rule}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ ...FS_C.type.h2, fontSize: 22 }}>Tue · Jun 18</div>
              <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 15, marginTop: 2 }}>
                2:00p · with Nadia Rivera
              </div>
            </div>
            <div style={{ ...FS_C.type.display3, fontSize: 26, color: FS_C.color.plum }}>2:00</div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${FS_C.color.rule}`, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ ...FS_C.type.bodySm, color: FS_C.color.softInk }}>Partial highlights + cut</div>
            <div style={{ ...FS_C.type.meta, color: FS_C.color.plum }}>$245 · 3h 15m</div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <FS_C.Button variant="primary" size="sm" style={{ flex: 1 }}>View details</FS_C.Button>
            <FS_C.Button variant="secondary" size="sm">Reschedule</FS_C.Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '20px 16px', background: FS_C.color.cream }}>
            <div style={{ ...FS_C.type.h2, fontSize: 20, lineHeight: 1 }}>Book<br/>again</div>
            <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 13, marginTop: 8 }}>Same service, same chair.</div>
          </div>
          <div style={{ padding: '20px 16px', background: FS_C.color.cream }}>
            <div style={{ ...FS_C.type.h2, fontSize: 20, lineHeight: 1 }}>Try<br/>someone new</div>
            <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 13, marginTop: 8 }}>Browse stylists.</div>
          </div>
        </div>
      </div>

      {/* Last visit snippet */}
      <div style={{ padding: '0 22px 24px' }}>
        <FS_C.Eyebrow style={{ marginBottom: 10 }}>LAST VISIT · MAR 4</FS_C.Eyebrow>
        <div style={{ padding: '14px 0', borderTop: `1px solid ${FS_C.color.rule}`, borderBottom: `1px solid ${FS_C.color.rule}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: FS_C.color.peachSoft }}/>
          <div style={{ flex: 1 }}>
            <div style={{ ...FS_C.type.h3, fontSize: 14 }}>Balayage refresh + trim</div>
            <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 13, marginTop: 2 }}>Nadia · $210</div>
          </div>
          <div style={{ ...FS_C.type.meta, color: FS_C.color.plum }}>VIEW →</div>
        </div>
      </div>
    </ClientShell>
  );
}

// ─── UPCOMING · Detail ────────────────────────────────────────────
function C_Upcoming() {
  return (
    <ClientShell tab="Home">
      {/* Back + title */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.plum }}>‹ HOME</div>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.soft }}>CONFIRMATION #4281</div>
      </div>

      {/* Masthead */}
      <div style={{ margin: '14px 22px 20px', background: FS_C.color.peach, padding: '22px 22px 24px' }}>
        <FS_C.Eyebrow color={FS_C.color.plumDeep} style={{ marginBottom: 6 }}>UPCOMING</FS_C.Eyebrow>
        <div style={{ ...FS_C.type.display2, fontSize: 54, color: FS_C.color.ink, letterSpacing: -1, lineHeight: 0.9 }}>
          Tuesday.<br/>2:00.
        </div>
        <div style={{ ...FS_C.type.editorialLg, fontSize: 20, color: FS_C.color.plumDeep, marginTop: 8 }}>
          June 18 · in 2 days
        </div>
      </div>

      {/* Appointment summary */}
      <div style={{ padding: '0 22px 18px' }}>
        <FS_C.SummaryRow label="With"     value="Nadia Rivera"/>
        <FS_C.SummaryRow label="Service"  value="Partial highlights + cut"/>
        <FS_C.SummaryRow label="Duration" value="3 hours, 15 minutes"/>
        <FS_C.SummaryRow label="Estimate" value="$245 · $50 deposit paid"/>
        <FS_C.SummaryRow label="Where"    value="Fringe West Loop · 842 N Ada"/>
      </div>

      {/* Prep checklist */}
      <div style={{ padding: '18px 22px', borderTop: `1px solid ${FS_C.color.rule}` }}>
        <FS_C.Eyebrow style={{ marginBottom: 12 }}>PREP · FROM NADIA</FS_C.Eyebrow>
        {[
          'Come with dry, product-free hair.',
          'Bring 2–3 reference photos if you have them.',
          'Eat before — you\'ll be in-chair ~3 hours.',
        ].map((t, i) => (
          <div key={i} style={{ padding: '10px 0', borderTop: i ? `1px solid ${FS_C.color.rule}` : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ ...FS_C.type.meta, color: FS_C.color.plum, width: 20 }}>0{i+1}</div>
            <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 15, flex: 1 }}>{t}</div>
          </div>
        ))}
      </div>

      {/* Your intake summary (read-only) */}
      <div style={{ padding: '18px 22px', borderTop: `1px solid ${FS_C.color.rule}` }}>
        <FS_C.Eyebrow style={{ marginBottom: 12 }}>WHAT YOU ASKED FOR</FS_C.Eyebrow>
        <div style={{ padding: '14px 16px', background: FS_C.color.cream }}>
          <div style={{ ...FS_C.type.editorial, fontSize: 16, color: FS_C.color.ink, lineHeight: 1.5 }}>
            "Lived-in blonde, no brassy tones. Face-framing pieces."
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, background: '#b89461', border: `1px solid ${FS_C.color.rule}` }}/>
            <div style={{ ...FS_C.type.meta, color: FS_C.color.soft }}>L7 → L8</div>
            <div style={{ width: 28, height: 28, background: '#d1b283', border: `1px solid ${FS_C.color.rule}` }}/>
          </div>
        </div>
        <div style={{ marginTop: 10, ...FS_C.type.meta, color: FS_C.color.plum, textAlign: 'right' }}>
          EDIT BRIEF →
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 22px 24px', borderTop: `1px solid ${FS_C.color.rule}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FS_C.Button variant="secondary" size="lg">Add to calendar</FS_C.Button>
        <FS_C.Button variant="secondary" size="lg">Reschedule</FS_C.Button>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.soft, textAlign: 'center', marginTop: 4, padding: '10px 0' }}>
          CANCEL APPOINTMENT
        </div>
      </div>
    </ClientShell>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────
function C_History() {
  const visits = [
    { y: '2025', date: 'Mar 4',  svc: 'Balayage refresh + trim',  stylist: 'Nadia', price: 210, star: 5 },
    { y: '2024', date: 'Dec 12', svc: 'Cut + gloss',               stylist: 'Nadia', price: 140, star: 5 },
    { y: '2024', date: 'Sep 3',  svc: 'Full balayage',             stylist: 'Nadia', price: 245, star: 5 },
    { y: '2024', date: 'May 21', svc: 'Cut + blow-dry',            stylist: 'Teo',   price: 95,  star: 4 },
    { y: '2024', date: 'Feb 8',  svc: 'Consultation',              stylist: 'Nadia', price: 0,   star: 5 },
  ];
  const totalSpend = visits.reduce((s, v) => s + v.price, 0);

  return (
    <ClientShell tab="History">
      {/* Header */}
      <div style={{ padding: '14px 22px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <FS_C.Wordmark size={16}/>
        </div>
        <FS_C.Eyebrow style={{ marginBottom: 6 }}>5 VISITS · SINCE FEB 2024</FS_C.Eyebrow>
        <div style={{ ...FS_C.type.display3, fontSize: 40, color: FS_C.color.ink, letterSpacing: -0.4, lineHeight: 0.95 }}>
          Your<br/>history.
        </div>
      </div>

      {/* Totals */}
      <div style={{ padding: '0 22px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '14px 14px', background: FS_C.color.cream, marginRight: 4 }}>
            <FS_C.Eyebrow color={FS_C.color.plum} style={{ fontSize: 9 }}>SPENT</FS_C.Eyebrow>
            <div style={{ ...FS_C.type.h2, fontSize: 22, marginTop: 4 }}>${totalSpend}</div>
          </div>
          <div style={{ padding: '14px 14px', background: FS_C.color.cream, marginLeft: 4 }}>
            <FS_C.Eyebrow color={FS_C.color.plum} style={{ fontSize: 9 }}>REGULAR</FS_C.Eyebrow>
            <div style={{ ...FS_C.type.h2, fontSize: 22, marginTop: 4 }}>Nadia</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: '0 22px' }}>
        {visits.map((v, i) => {
          const showYear = i === 0 || v.y !== visits[i - 1].y;
          return (
            <React.Fragment key={i}>
              {showYear && (
                <div style={{ padding: '14px 0 8px' }}>
                  <FS_C.Eyebrow>{v.y}</FS_C.Eyebrow>
                </div>
              )}
              <div style={{
                padding: '16px 0', borderTop: `1px solid ${FS_C.color.rule}`,
                display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ ...FS_C.type.h3, fontSize: 14 }}>{v.date.split(' ')[0].toUpperCase()}</div>
                  <div style={{ ...FS_C.type.display3, fontSize: 28, color: FS_C.color.plum, lineHeight: 1 }}>{v.date.split(' ')[1]}</div>
                </div>
                <div>
                  <div style={{ ...FS_C.type.h3, fontSize: 15 }}>{v.svc}</div>
                  <div style={{ ...FS_C.type.editorial, color: FS_C.color.softInk, fontSize: 14, marginTop: 2 }}>
                    with {v.stylist}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <div key={k} style={{ ...FS_C.type.meta, color: k < v.star ? FS_C.color.plum : FS_C.color.rule }}>★</div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...FS_C.type.h3, fontSize: 14 }}>{v.price ? `$${v.price}` : '—'}</div>
                  <div style={{ ...FS_C.type.meta, color: FS_C.color.plum, marginTop: 6 }}>REBOOK →</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ padding: '24px 22px 8px', textAlign: 'center' }}>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.soft }}>END OF HISTORY</div>
      </div>
    </ClientShell>
  );
}

// ─── ACCOUNT ──────────────────────────────────────────────────────
function C_Account() {
  const groups = [
    { g: 'Personal',   items: [
      { k: 'Name',             v: 'Mia Chen' },
      { k: 'Phone',            v: '+1 (312) 555-2849' },
      { k: 'Email',            v: 'mia@chen.email' },
      { k: 'Birthday',         v: 'Apr 12' },
    ]},
    { g: 'Hair profile', items: [
      { k: 'Current level',    v: 'L7 · dark blonde' },
      { k: 'Allergies',        v: 'None noted' },
      { k: 'Last chemical',    v: 'Gloss · Mar 4' },
      { k: 'Notes for stylist', v: '"No brassy tones."', edit: true },
    ]},
    { g: 'Payment',    items: [
      { k: 'Card',             v: '•••• 4821' },
      { k: 'Tip default',      v: '20%' },
    ]},
    { g: 'Preferences', items: [
      { k: 'Notifications',    v: 'Email + SMS' },
      { k: 'Appointment reminders', v: '24h before' },
      { k: 'Marketing',        v: 'Off' },
    ]},
  ];
  return (
    <ClientShell tab="Account">
      {/* Header */}
      <div style={{ padding: '14px 22px 18px' }}>
        <FS_C.Wordmark size={16}/>
      </div>

      {/* Profile card */}
      <div style={{ margin: '0 22px 24px', padding: '20px 20px', background: FS_C.color.peach, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: FS_C.color.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_C.type.display3, fontSize: 26, color: FS_C.color.plum }}>M</div>
        <div>
          <div style={{ ...FS_C.type.h2, fontSize: 22 }}>Mia Chen</div>
          <div style={{ ...FS_C.type.editorial, color: FS_C.color.plumDeep, fontSize: 14, marginTop: 2 }}>
            Member since Feb 2024
          </div>
        </div>
      </div>

      {/* Groups */}
      {groups.map(g => (
        <div key={g.g} style={{ padding: '0 22px 18px' }}>
          <FS_C.Eyebrow style={{ marginBottom: 8 }}>{g.g.toUpperCase()}</FS_C.Eyebrow>
          {g.items.map((it, i) => (
            <div key={it.k} style={{
              padding: '14px 0', borderTop: `1px solid ${FS_C.color.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            }}>
              <div style={{ ...FS_C.type.h3, fontSize: 13, color: FS_C.color.soft, letterSpacing: 1 }}>
                {it.k.toUpperCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ ...FS_C.type.editorial, fontSize: 15, color: FS_C.color.ink, textAlign: 'right', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.v}
                </div>
                <div style={{ ...FS_C.type.meta, color: FS_C.color.plum }}>›</div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Danger */}
      <div style={{ padding: '20px 22px 8px', borderTop: `1px solid ${FS_C.color.rule}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.soft, textAlign: 'center' }}>SIGN OUT</div>
        <div style={{ ...FS_C.type.meta, color: FS_C.color.coral, textAlign: 'center' }}>DELETE ACCOUNT</div>
      </div>

      <div style={{ padding: '20px 22px 8px', ...FS_C.type.meta, color: FS_C.color.soft, textAlign: 'center' }}>
        FRINGE · v2.4.1
      </div>
    </ClientShell>
  );
}

Object.assign(window, { C_Landing, C_Upcoming, C_History, C_Account });
