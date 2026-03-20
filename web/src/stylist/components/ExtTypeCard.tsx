import type { ExtensionType } from "../types";

interface ExtTypeCardProps {
  extType: ExtensionType;
  selected?: boolean;
  onClick?: () => void;
}

export function ExtTypeCard({ extType, selected, onClick }: ExtTypeCardProps) {
  return (
    <div
      data-part="ext-card"
      data-selected={selected || undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div data-part="ext-icon">{extType.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{extType.name}</div>
        <div style={{ fontSize: 12, color: selected ? "var(--color-accent-dark)" : "var(--color-text-muted)", marginTop: 2 }}>
          {extType.desc}
        </div>
      </div>
      {extType.time && (
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{extType.time}</span>
      )}
    </div>
  );
}
