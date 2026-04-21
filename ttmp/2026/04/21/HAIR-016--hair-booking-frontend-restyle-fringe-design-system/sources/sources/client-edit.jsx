// Client edit screens — modify Personal, Hair profile, Preferences.
// Depends on ClientShell from client-pages.jsx (loaded first).

const { FS: FS_E } = window;

// ─── Reusable edit primitives ─────────────────────────────────────
function EditHeader({ title }) {
  return (
    <div style={{ padding: '14px 22px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ ...FS_E.type.meta, color: FS_E.color.plum, fontSize: 11 }}>‹ ACCOUNT</div>
      <div style={{ ...FS_E.type.meta, color: FS_E.color.soft }}>CANCEL</div>
    </div>
  );
}

function EditTitle({ eyebrow, title, sub }) {
  return (
    <div style={{ padding: '14px 22px 22px' }}>
      <FS_E.Eyebrow style={{ marginBottom: 6 }}>{eyebrow}</FS_E.Eyebrow>
      <div style={{ ...FS_E.type.display3, fontSize: 40, color: FS_E.color.ink, letterSpacing: -0.4, lineHeight: 0.95 }}>
        {title}
      </div>
      {sub && (
        <div style={{ ...FS_E.type.editorial, color: FS_E.color.softInk, fontSize: 16, marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, placeholder, multiline, suffix }) {
  return (
    <div style={{ padding: '14px 0', borderTop: `1px solid ${FS_E.color.rule}` }}>
      <div style={{ ...FS_E.type.meta, fontSize: 10, color: FS_E.color.plum, marginBottom: 8 }}>{label.toUpperCase()}</div>
      {multiline ? (
        <textarea defaultValue={value} placeholder={placeholder} style={{
          width: '100%', minHeight: 90, padding: 0, background: 'transparent',
          border: 'none', fontFamily: FS_E.font.serif, fontSize: 18, fontStyle: 'italic',
          color: FS_E.color.ink, lineHeight: 1.4, resize: 'none', outline: 'none',
        }}/>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <input defaultValue={value} placeholder={placeholder} style={{
            flex: 1, padding: 0, background: 'transparent', border: 'none',
            fontFamily: FS_E.font.sans, fontSize: 17, color: FS_E.color.ink, outline: 'none',
          }}/>
          {suffix && <div style={{ ...FS_E.type.meta, color: FS_E.color.soft }}>{suffix}</div>}
        </div>
      )}
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? FS_E.color.plum : FS_E.color.rule,
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: 999, background: FS_E.color.paper,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </div>
  );
}

function ToggleRow({ label, sub, on }) {
  return (
    <div style={{
      padding: '14px 0', borderTop: `1px solid ${FS_E.color.rule}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ ...FS_E.type.h3, fontSize: 14, color: FS_E.color.ink }}>{label}</div>
        {sub && <div style={{ ...FS_E.type.editorial, color: FS_E.color.softInk, fontSize: 13, marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={on}/>
    </div>
  );
}

function SaveBar({ label = 'Save changes' }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '14px 22px 26px', background: FS_E.color.paper,
      borderTop: `1px solid ${FS_E.color.rule}`,
      display: 'flex', gap: 10,
    }}>
      <FS_E.Button variant="primary" size="lg" style={{ flex: 1 }}>{label}</FS_E.Button>
    </div>
  );
}

// ─── EDIT · Personal ──────────────────────────────────────────────
function C_EditPersonal() {
  return (
    <ClientShell tab="Account" noTab>
      <EditHeader/>
      <EditTitle
        eyebrow="PERSONAL"
        title={<>Who<br/>you are.</>}
        sub="Used for reminders and at check-in."
      />

      <div style={{ padding: '0 22px 28px' }}>
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0 18px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: FS_E.color.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS_E.type.display3, fontSize: 30, color: FS_E.color.plum }}>M</div>
          <div>
            <div style={{ ...FS_E.type.h3, fontSize: 13, color: FS_E.color.plum, letterSpacing: 1 }}>CHANGE PHOTO</div>
            <div style={{ ...FS_E.type.editorial, color: FS_E.color.softInk, fontSize: 13, marginTop: 4 }}>JPG or PNG, under 4MB</div>
          </div>
        </div>

        <Field label="Name"      value="Mia Chen"/>
        <Field label="Phone"     value="+1 (312) 555-2849"/>
        <Field label="Email"     value="mia@chen.email"/>
        <Field label="Birthday"  value="Apr 12, 1996" suffix="📅"/>
        <Field label="Pronouns"  value="" placeholder="Optional — e.g. she/her"/>
      </div>

      <div style={{ height: 100 }}/>
      <SaveBar/>
    </ClientShell>
  );
}

// ─── EDIT · Hair Profile ──────────────────────────────────────────
function C_EditHair() {
  const levels = [
    { k: 'L2', c: '#1a120c' },
    { k: 'L3', c: '#3d2a1e' },
    { k: 'L4', c: '#5a3e2a' },
    { k: 'L5', c: '#7a5638' },
    { k: 'L6', c: '#9b7547' },
    { k: 'L7', c: '#b89461', sel: true },
    { k: 'L8', c: '#d1b283' },
    { k: 'L9', c: '#e2ce9e' },
    { k: 'L10', c: '#ead9af' },
  ];
  const textures = ['Straight', 'Wavy', 'Curly', 'Coily'];
  return (
    <ClientShell tab="Account" noTab>
      <EditHeader/>
      <EditTitle
        eyebrow="HAIR PROFILE"
        title={<>The<br/>basics.</>}
        sub="Shared with your stylist ahead of every appointment."
      />

      {/* Current level */}
      <div style={{ padding: '0 22px 20px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 12 }}>01 — CURRENT LEVEL</FS_E.Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {levels.map(l => (
            <div key={l.k} style={{
              aspectRatio: '1/1.4', background: l.c, position: 'relative',
              border: l.sel ? `2px solid ${FS_E.color.plum}` : `1px solid ${FS_E.color.rule}`,
              cursor: 'pointer',
            }}>
              {l.sel && <div style={{
                position: 'absolute', bottom: -22, left: 0, right: 0, textAlign: 'center',
                ...FS_E.type.meta, fontSize: 9, color: FS_E.color.plum, fontWeight: 600,
              }}>{l.k}</div>}
            </div>
          ))}
        </div>
        <div style={{ ...FS_E.type.editorial, color: FS_E.color.softInk, fontSize: 14, marginTop: 32, fontStyle: 'italic' }}>
          Level 7 · dark blonde · warm undertone
        </div>
      </div>

      {/* Texture */}
      <div style={{ padding: '4px 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 12 }}>02 — TEXTURE</FS_E.Eyebrow>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {textures.map((t, i) => (
            <FS_E.Chip key={t} selected={i === 1}>{t}</FS_E.Chip>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div style={{ padding: '4px 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 10 }}>03 — ALLERGIES · SENSITIVITIES</FS_E.Eyebrow>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {['PPD', 'Ammonia', 'Sulfates', 'Fragrance', 'Latex'].map((t) => (
            <FS_E.Chip key={t}>{t}</FS_E.Chip>
          ))}
        </div>
        <Field label="Other" value="" placeholder="Add anything your stylist should know"/>
      </div>

      {/* Chemical log */}
      <div style={{ padding: '4px 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 10 }}>04 — LAST CHEMICAL SERVICE</FS_E.Eyebrow>
        <div style={{ padding: '12px 14px', background: FS_E.color.cream, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ ...FS_E.type.h3, fontSize: 14 }}>Gloss · Mar 4</div>
            <div style={{ ...FS_E.type.editorial, color: FS_E.color.softInk, fontSize: 13, marginTop: 2 }}>
              with Nadia Rivera
            </div>
          </div>
          <div style={{ ...FS_E.type.meta, color: FS_E.color.plum }}>EDIT</div>
        </div>
        <div style={{ marginTop: 10, ...FS_E.type.meta, color: FS_E.color.plum, textAlign: 'right' }}>
          + ADD PAST SERVICE
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '4px 22px 28px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 10 }}>05 — NOTES FOR YOUR STYLIST</FS_E.Eyebrow>
        <Field label="&nbsp;" value="No brassy tones. Keep face-framing pieces soft." multiline/>
      </div>

      <div style={{ height: 100 }}/>
      <SaveBar/>
    </ClientShell>
  );
}

// ─── EDIT · Preferences ───────────────────────────────────────────
function C_EditPreferences() {
  return (
    <ClientShell tab="Account" noTab>
      <EditHeader/>
      <EditTitle
        eyebrow="PREFERENCES"
        title={<>How we<br/>reach you.</>}
      />

      <div style={{ padding: '0 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 4 }}>CHANNELS</FS_E.Eyebrow>
        <ToggleRow label="Email"      sub="Confirmations, receipts" on={true}/>
        <ToggleRow label="SMS"        sub="Reminders, late notes" on={true}/>
        <ToggleRow label="Push"       sub="Real-time updates" on={false}/>
      </div>

      <div style={{ padding: '4px 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 4 }}>REMINDERS</FS_E.Eyebrow>
        <div style={{ padding: '14px 0', borderTop: `1px solid ${FS_E.color.rule}` }}>
          <div style={{ ...FS_E.type.h3, fontSize: 14, marginBottom: 10 }}>Appointment reminder</div>
          <FS_E.Segmented
            options={['1 hr', '12 hr', '24 hr', '48 hr']}
            value={'24 hr'}
            onChange={() => {}}
          />
        </div>
        <ToggleRow label="Prep checklist day-before" sub="A note from your stylist" on={true}/>
        <ToggleRow label="Rebook nudge"              sub="Every 6–8 weeks" on={false}/>
      </div>

      <div style={{ padding: '4px 22px 18px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 4 }}>MARKETING</FS_E.Eyebrow>
        <ToggleRow label="Newsletter"     sub="Seasonal tips · monthly" on={false}/>
        <ToggleRow label="Promotions"     sub="Only from Fringe, never resold" on={false}/>
      </div>

      <div style={{ padding: '4px 22px 28px' }}>
        <FS_E.Eyebrow style={{ marginBottom: 4 }}>PRIVACY</FS_E.Eyebrow>
        <ToggleRow label="Share photos with stylist only" sub="Hidden from the rest of the salon" on={true}/>
        <ToggleRow label="Public review display"          sub="Your first name + initial" on={true}/>
      </div>

      <div style={{ height: 100 }}/>
      <SaveBar/>
    </ClientShell>
  );
}

Object.assign(window, { C_EditPersonal, C_EditHair, C_EditPreferences });
