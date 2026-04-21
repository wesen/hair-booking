// Fringe stylist — You / Profile page
// Replaces: (part of HomePage on "You" tab)
// API: stylistApi.getMe() → StylistMeDto; servicesApi.getServices()

import { color, font } from "../../../fringe-ui/tokens";
import { StylistShell } from "../../../fringe-ui/layout/StylistShell";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { Card } from "../../../fringe-ui/primitives/Card";
import { Button } from "../../../fringe-ui/primitives/Button";
import type { StylistMeDto } from "../../../stylist/store/api/types";

interface YouPageProps {
  me: StylistMeDto | null;
  rating: string;
  reviewCount: string;
  weekEarnings: string;
  rebookRate: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut?: () => void;
}

const NAV_GROUPS = [
  {
    group: "Business",
    items: [
      { key: "Services & pricing",  value: "12 services",      arrow: true },
      { key: "Availability",      value: "Tue–Sat · 9a–7p",   arrow: true },
      { key: "Payouts",             value: "$4,820 pending",    arrow: true, accent: true },
    ],
  },
  {
    group: "Your page",
    items: [
      { key: "Portfolio",           value: "24 photos",        arrow: true },
      { key: "Bio & specialties",    value: "Lived-in blonde, balayage", arrow: true },
      { key: "Reviews",             value: "4.9 ★ · 320 reviews", arrow: true },
    ],
  },
  {
    group: "App",
    items: [
      { key: "Notifications",       value: "All on",           arrow: true },
      { key: "Language",            value: "English",            arrow: true },
      { key: "Help & support",      value: "",                  arrow: true },
      { key: "Sign out",            value: "",                  arrow: false, danger: true },
    ],
  },
];

export function YouPage({ me, rating, reviewCount, weekEarnings, rebookRate, activeTab, onTabChange, onSignOut }: YouPageProps) {
  const name = me?.displayName ?? "Nadia Rivera";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <StylistShell activeTab={activeTab} onTabChange={onTabChange}>
      {/* Header */}
      <div style={{ padding: "14px 22px 18px" }}>
        <Eyebrow>PROFILE</Eyebrow>
        <div style={{ fontFamily: font.block, fontSize: 40, textTransform: "uppercase" as const, letterSpacing: -0.4, lineHeight: 0.95 }}>
          You.
        </div>
      </div>

      {/* Profile card */}
      <div style={{ margin: "0 22px 20px", padding: "20px 20px", background: color.cream, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: color.coral,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: font.block,
          fontSize: 26,
          color: color.paper,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.block, fontSize: 22, textTransform: "uppercase" as const }}>{name}</div>
          <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 15, color: color.softInk, marginTop: 2 }}>
            Senior colorist · Fringe West Loop
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 10 }}>
            <span style={{
              fontFamily: font.mono,
              fontSize: 9,
              letterSpacing: 1.2,
              textTransform: "uppercase" as const,
              padding: "2px 6px",
              background: color.coral,
              color: color.paper,
            }}>
              TOP 1%
            </span>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: color.soft }}>
              SINCE 2021
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: "0 22px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { k: "RATING",  v: rating,        sub: `${reviewCount} reviews` },
            { k: "THIS WK", v: weekEarnings,   sub: "18 booked" },
            { k: "REBOOK", v: rebookRate,      sub: "last 90 days" },
          ].map((s, i) => (
            <div key={s.k} style={{
              padding: "14px 12px",
              textAlign: "center" as const,
              borderLeft: i === 0 ? "none" : `1px solid ${color.rule}`,
            }}>
              <Eyebrow color={color.coral} style={{ fontSize: 9 }}>{s.k}</Eyebrow>
              <div style={{ fontFamily: font.block, fontSize: 26, marginTop: 4, color: color.ink }}>{s.v}</div>
              <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 12, color: color.soft, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav groups */}
      {NAV_GROUPS.map((g) => (
        <div key={g.group} style={{ padding: "0 22px 14px" }}>
          <Eyebrow style={{ marginBottom: 8 }}>{g.group.toUpperCase()}</Eyebrow>
          {g.items.map((it) => (
            <div
              key={it.key}
              style={{
                padding: "14px 0",
                borderTop: `1px solid ${color.rule}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                justifyContent: "space-between" as const,
                cursor: it.key === "Sign out" ? "pointer" : "default",
              }}
              onClick={it.key === "Sign out" ? onSignOut : undefined}
            >
              <div style={{
                fontFamily: font.block,
                fontSize: 14,
                color: it.danger ? color.coral : color.ink,
              }}>
                {it.key}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {it.value && (
                  <div style={{
                    fontFamily: font.serif,
                    fontStyle: "italic",
                    fontSize: 14,
                    color: it.accent ? color.coral : color.soft,
                  }}>
                    {it.value}
                  </div>
                )}
                {it.arrow && (
                  <div style={{ fontFamily: font.mono, fontSize: 11, color: color.soft }}>›</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{
        padding: "12px 22px 28px",
        fontFamily: font.mono,
        fontSize: 10,
        color: color.soft,
        textAlign: "center" as const,
      }}>
        FRINGE · v2.4.1
      </div>
    </StylistShell>
  );
}

export default YouPage;