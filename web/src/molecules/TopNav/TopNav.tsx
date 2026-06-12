import type { CSSProperties, ReactNode } from "react";
import { color, font, type as typeToken } from "../../fringe-ui/tokens";

export interface TopNavProps {
  /** Accent color token name (e.g. "butter", "sage") */
  accent?: string;
  /** Active navigation item key */
  activeItem?: string;
  /** User display info */
  user?: { name: string; initial: string };
  /** Optional style override */
  style?: CSSProperties;
}

const navItems = ["Services", "Book", "Stylists", "Journal"] as const;

export function TopNav({
  accent = color.plum,
  activeItem = "Book",
  user = { name: "Mia", initial: "M" },
  style,
}: TopNavProps) {
  return (
    <div
      data-component="TopNav"
      style={{
        height: 64,
        padding: "0 40px",
        borderBottom: `1px solid ${color.rule}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: color.paper,
        fontFamily: font.sans,
        ...style,
      }}
    >
      {/* Left: wordmark + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div
          style={{
            fontFamily: font.block,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          Fringe
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {navItems.map((item) => {
            const isActive = item === activeItem;
            return (
              <div
                key={item}
                style={{
                  ...typeToken.meta,
                  letterSpacing: 1.8,
                  fontSize: 11,
                  color: isActive ? color.ink : color.softInk,
                  borderBottom: isActive
                    ? `2px solid ${accent}`
                    : "2px solid transparent",
                  padding: "22px 0",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: user greeting + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ ...typeToken.meta, color: color.soft }}>
          Hi, {user.name}
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...typeToken.h3,
            fontSize: 13,
            color: color.ink,
          }}
        >
          {user.initial}
        </div>
      </div>
    </div>
  );
}
