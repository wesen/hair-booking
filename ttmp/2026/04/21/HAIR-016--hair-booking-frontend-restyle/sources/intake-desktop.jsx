// Desktop intake layouts — Butter + Sage color-accent variants
// Two explorations: 'Butter' uses butter as hero/panel color w/ plum ink,
// 'Sage' uses sage w/ cream — same layout skeleton, different mood.

const { FS: FS_D } = window;

// ─── Shared desktop chrome ────────────────────────────────────────
function DesktopShell({ accent, accentInk, children }) {
  return (
    <div style={{ width: '100%', height: '100%', background: FS_D.color.paper, display: 'flex', flexDirection: 'column', fontFamily: FS_D.font.sans }}>
      {/* Top nav */}
      <div style={{
        height: 64, padding: '0 40px', borderBottom: `1px solid ${FS_D.color.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: FS_D.color.paper,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <FS_D.Wordmark size={20}/>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Services', 'Book', 'Stylists', 'Journal'].map((n, i) => (
              <div key={n} style={{
                ...FS_D.type.meta, letterSpacing: 1.8, fontSize: 11,
                color: i === 1 ? FS_D.color.ink : FS_D.color.softInk,
                borderBottom: i === 1 ? `2px solid ${accent}` : '2px solid transparent',
                padding: '22px 0', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
              }}>{n}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ ...FS_D.type.meta, color: FS_D.color.soft }}>Hi, Mia</div>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_D.type.h3, fontSize: 13, color: accentInk }}>M</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

// Step rail used on all desktop screens
function StepRail({ current, accent }) {
  const steps = [
    '01 Service', '02 Color', '03 Length', '04 Photos',
    '05 History', '06 Budget', '07 Estimate', '08 Booking', '09 Confirm',
  ];
  return (
    <div style={{ width: 220, padding: '32px 28px', borderRight: `1px solid ${FS_D.color.rule}`, background: FS_D.color.cream, flexShrink: 0 }}>
      <FS_D.Eyebrow style={{ marginBottom: 20 }}>Intake · 9 steps</FS_D.Eyebrow>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} style={{
            padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10,
            borderTop: i === 0 ? 'none' : `1px solid ${FS_D.color.rule}`,
            color: active ? FS_D.color.ink : done ? FS_D.color.softInk : FS_D.color.soft,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: 999,
              background: active ? accent : done ? FS_D.color.plum : 'transparent',
              border: !active && !done ? `1px solid ${FS_D.color.soft}` : 'none',
            }}/>
            <div style={{ ...FS_D.type.h3, fontSize: 12, letterSpacing: 1 }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 07 Estimate — Butter ─────────────────────────────────────────
function D_Estimate_Butter() {
  const accent = FS_D.color.butter;
  return (
    <DesktopShell accent={accent} accentInk={FS_D.color.ink}>
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <StepRail current={6} accent={accent}/>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
          {/* Left — context */}
          <div style={{ padding: '48px 56px' }}>
            <FS_D.Eyebrow style={{ marginBottom: 10 }}>Chapter VII · The Quote</FS_D.Eyebrow>
            <div style={{ ...FS_D.type.display2, fontSize: 84, color: FS_D.color.ink, letterSpacing: -1.5, marginBottom: 8 }}>
              Your<br/>estimate.
            </div>
            <div style={{ ...FS_D.type.editorialLg, fontSize: 22, color: FS_D.color.softInk, maxWidth: 440, marginTop: 14 }}>
              Based on what you've shared. Final number depends on an in-chair look.
            </div>

            <div style={{ marginTop: 48, borderTop: `1px solid ${FS_D.color.rule}` }}>
              <FS_D.SummaryRow label="Service" value="Partial highlights + cut" onEdit={() => {}}/>
              <FS_D.SummaryRow label="Color level" value="Level 7 → Level 8" onEdit={() => {}}/>
              <FS_D.SummaryRow label="Length" value="Mid-back · no extensions" onEdit={() => {}}/>
              <FS_D.SummaryRow label="Add-ons" value="Olaplex bond treatment · $45"/>
              <FS_D.SummaryRow label="Condition" value="Breakage 2/5 · Frizz 3/5"/>
            </div>

            <div style={{ marginTop: 32 }}>
              <FS_D.Note tone="warn">
                Color corrections or unexpected length may adjust the final quote in-salon.
              </FS_D.Note>
            </div>
          </div>

          {/* Right — butter panel with number */}
          <div style={{ background: accent, padding: '56px 56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 680 }}>
            <div>
              <FS_D.Eyebrow color={FS_D.color.plumDeep}>ESTIMATED · USD</FS_D.Eyebrow>
              <div style={{ ...FS_D.type.display1, fontSize: 220, color: FS_D.color.ink, letterSpacing: -6, lineHeight: 0.82, marginTop: 12 }}>
                $245
              </div>
              <div style={{ ...FS_D.type.editorialLg, fontSize: 26, color: FS_D.color.plumDeep, marginTop: 8 }}>
                3 hours, 15 minutes.
              </div>
            </div>

            <div>
              <div style={{ padding: '16px 0', borderTop: `1px solid ${FS_D.color.ink}`, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ ...FS_D.type.meta, color: FS_D.color.ink }}>LOW</div>
                <div style={{ ...FS_D.type.h2, color: FS_D.color.ink }}>$220</div>
              </div>
              <div style={{ padding: '16px 0', borderTop: `1px solid ${FS_D.color.ink}`, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ ...FS_D.type.meta, color: FS_D.color.ink }}>LIKELY</div>
                <div style={{ ...FS_D.type.h2, color: FS_D.color.ink }}>$245</div>
              </div>
              <div style={{ padding: '16px 0', borderTop: `1px solid ${FS_D.color.ink}`, borderBottom: `1px solid ${FS_D.color.ink}`, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ ...FS_D.type.meta, color: FS_D.color.ink }}>HIGH</div>
                <div style={{ ...FS_D.type.h2, color: FS_D.color.ink }}>$285</div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <FS_D.Button variant="secondary" style={{ borderColor: FS_D.color.ink, color: FS_D.color.ink }}>Adjust</FS_D.Button>
                <FS_D.Button variant="primary" size="lg" style={{ flex: 1, background: FS_D.color.ink }}>Continue to booking →</FS_D.Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ─── 08 Booking — Sage ────────────────────────────────────────────
function D_Booking_Sage() {
  const accent = FS_D.color.sage;
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <DesktopShell accent={accent} accentInk={FS_D.color.paper}>
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <StepRail current={7} accent={accent}/>
        <div style={{ flex: 1, padding: '48px 56px' }}>
          <FS_D.Eyebrow style={{ marginBottom: 10 }}>Chapter VIII · The Date</FS_D.Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36 }}>
            <div style={{ ...FS_D.type.display2, fontSize: 76, color: FS_D.color.ink, letterSpacing: -1 }}>
              When suits you?
            </div>
            <div style={{ ...FS_D.type.editorial, color: FS_D.color.softInk, maxWidth: 320 }}>
              Nadia's open slots for the next 4 weeks. Book holds with a $50 deposit.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
            {/* Calendar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ ...FS_D.type.h2 }}>June 2025</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ width: 36, height: 36, border: `1px solid ${FS_D.color.rule}`, background: 'transparent', cursor: 'pointer' }}>‹</button>
                  <button style={{ width: 36, height: 36, border: `1px solid ${FS_D.color.rule}`, background: 'transparent', cursor: 'pointer' }}>›</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                  <div key={d} style={{ ...FS_D.type.meta, color: FS_D.color.soft, textAlign: 'center', padding: '6px 0 10px' }}>{d}</div>
                ))}
                {days.map(d => {
                  const has = [14,17,18,19,23,24,26,30].includes(d);
                  const sel = d === 18;
                  const past = d < 12;
                  return (
                    <div key={d} style={{
                      aspectRatio: '1', background: sel ? accent : past ? 'transparent' : has ? FS_D.color.cream : 'transparent',
                      border: sel ? 'none' : `1px solid ${FS_D.color.rule}`,
                      color: sel ? FS_D.color.paper : past ? FS_D.color.soft : FS_D.color.ink,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: past ? 'default' : 'pointer', padding: 8, position: 'relative',
                    }}>
                      <div style={{ ...FS_D.type.h2, fontSize: 22 }}>{d}</div>
                      {has && !sel && <div style={{ ...FS_D.type.meta, color: accent, fontSize: 9, marginTop: 2 }}>{[2,3,4,1,3,2,1,2][has ? [14,17,18,19,23,24,26,30].indexOf(d) : 0]} OPEN</div>}
                      {sel && <div style={{ ...FS_D.type.meta, color: FS_D.color.paper, fontSize: 9, marginTop: 2 }}>SELECTED</div>}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 32 }}>
                <FS_D.Eyebrow style={{ marginBottom: 14 }}>Tue, Jun 18 · open times</FS_D.Eyebrow>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {['9:00a','10:30a','12:00p','2:00p','4:30p'].map((t, i) => (
                    <div key={t} style={{
                      padding: '14px 6px', textAlign: 'center',
                      ...FS_D.type.h3, fontSize: 15,
                      background: i === 3 ? FS_D.color.ink : 'transparent',
                      color: i === 3 ? FS_D.color.paper : FS_D.color.ink,
                      border: `1px solid ${i === 3 ? FS_D.color.ink : FS_D.color.rule}`,
                      cursor: 'pointer',
                    }}>{t}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stylist panel */}
            <div>
              <div style={{ background: accent, padding: '28px 26px', color: FS_D.color.paper }}>
                <FS_D.Eyebrow color="rgba(255,255,255,0.7)" style={{ marginBottom: 14 }}>YOUR STYLIST</FS_D.Eyebrow>
                <div style={{ width: 72, height: 72, borderRadius: 999, background: FS_D.color.paper, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_D.type.display3, fontSize: 32, color: accent }}>N</div>
                <div style={{ ...FS_D.type.h2, color: FS_D.color.paper, fontSize: 28 }}>Nadia Rivera</div>
                <div style={{ ...FS_D.type.editorial, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Senior colorist · lived-in blonde</div>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid rgba(255,255,255,0.3)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <div style={{ ...FS_D.type.meta, color: 'rgba(255,255,255,0.7)' }}>STARTING</div>
                    <div style={{ ...FS_D.type.h3, color: FS_D.color.paper }}>$180+</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <div style={{ ...FS_D.type.meta, color: 'rgba(255,255,255,0.7)' }}>BOOKED</div>
                    <div style={{ ...FS_D.type.h3, color: FS_D.color.paper }}>4.9 ★ · 320</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <div style={{ ...FS_D.type.meta, color: 'rgba(255,255,255,0.7)' }}>SPEAKS</div>
                    <div style={{ ...FS_D.type.h3, color: FS_D.color.paper }}>EN · ES</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px 0' }}>
                <FS_D.Eyebrow style={{ marginBottom: 10 }}>Not the right fit?</FS_D.Eyebrow>
                {['Josephine L.', 'Teo Marino', 'Iris Kwan'].map((n, i) => (
                  <div key={n} style={{ padding: '10px 0', borderTop: `1px solid ${FS_D.color.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ ...FS_D.type.h3, fontSize: 14 }}>{n}</div>
                      <div style={{ ...FS_D.type.meta, color: FS_D.color.soft, marginTop: 2 }}>{['Colorist','Stylist','Colorist'][i]} · {['$160+','$140+','$200+'][i]}</div>
                    </div>
                    <div style={{ ...FS_D.type.meta, color: accent }}>VIEW →</div>
                  </div>
                ))}
              </div>

              <FS_D.Button variant="primary" size="lg" style={{ width: '100%', background: FS_D.color.ink }}>
                Hold this slot →
              </FS_D.Button>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ─── 09 Confirm — Butter hero ─────────────────────────────────────
function D_Confirm_Butter() {
  const accent = FS_D.color.butter;
  return (
    <DesktopShell accent={accent} accentInk={FS_D.color.ink}>
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <StepRail current={8} accent={accent}/>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: accent, padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <FS_D.Eyebrow color={FS_D.color.plumDeep} style={{ marginBottom: 24 }}>CONFIRMATION · #4281</FS_D.Eyebrow>
              <div style={{ ...FS_D.type.display1, fontSize: 150, color: FS_D.color.ink, letterSpacing: -4, lineHeight: 0.85 }}>
                See you<br/><span style={{ fontFamily: FS_D.font.serif, fontStyle: 'italic', textTransform: 'none', letterSpacing: -2 }}>Tuesday.</span>
              </div>
            </div>
            <div>
              <div style={{ ...FS_D.type.editorialLg, fontSize: 24, color: FS_D.color.plumDeep, maxWidth: 420 }}>
                Confirmation and prep notes are on their way. Arrive with hair dry and product-free.
              </div>
            </div>
          </div>

          <div style={{ padding: '64px 56px' }}>
            <FS_D.Eyebrow style={{ marginBottom: 24 }}>YOUR APPOINTMENT</FS_D.Eyebrow>
            <FS_D.SummaryRow label="When"     value="Tue, Jun 18 · 2:00p"/>
            <FS_D.SummaryRow label="With"     value="Nadia Rivera"/>
            <FS_D.SummaryRow label="Service"  value="Partial highlights + cut"/>
            <FS_D.SummaryRow label="Estimate" value="$245 · 3h 15m"/>
            <FS_D.SummaryRow label="Deposit"  value="$50 held · applied to total"/>
            <FS_D.SummaryRow label="Location" value="Fringe West Loop · 842 N Ada"/>

            <div style={{ marginTop: 32 }}>
              <FS_D.Note tone="success">Deposit received. Cancellations inside 24h forfeit deposit.</FS_D.Note>
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <FS_D.Button variant="secondary">Add to calendar</FS_D.Button>
              <FS_D.Button variant="secondary">Message Nadia</FS_D.Button>
              <FS_D.Button variant="ghost" style={{ marginLeft: 'auto', color: FS_D.color.soft }}>Cancel</FS_D.Button>
            </div>

            <div style={{ marginTop: 48, padding: '20px 0', borderTop: `1px solid ${FS_D.color.rule}` }}>
              <FS_D.Eyebrow style={{ marginBottom: 10 }}>Prep for Tuesday</FS_D.Eyebrow>
              <ol style={{ ...FS_D.type.bodyLg, color: FS_D.color.softInk, paddingLeft: 20, margin: 0 }}>
                <li style={{ padding: '4px 0' }}>Come with dry, product-free hair.</li>
                <li style={{ padding: '4px 0' }}>Bring 2–3 reference photos (front, side, back).</li>
                <li style={{ padding: '4px 0' }}>Eat before — you'll be in-chair ~3 hours.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

Object.assign(window, { D_Estimate_Butter, D_Booking_Sage, D_Confirm_Butter });
