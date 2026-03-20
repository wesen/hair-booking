import type { MaintenanceItem } from "../types";

interface MaintenancePlanCardProps {
  items: MaintenanceItem[];
}

export function MaintenancePlanCard({ items }: MaintenancePlanCardProps) {
  return (
    <div data-part="maintenance-plan">
      <div data-part="section-label">MAINTENANCE PLAN</div>
      {items.map((item, i) => (
        <div key={i} data-part="maintenance-item">
          <div data-part="maintenance-dot" data-status={item.status} />
          <span style={{ fontWeight: item.status === "next" ? 600 : 400, color: item.status === "done" ? "var(--color-text-muted)" : "var(--color-text)" }}>
            {item.status === "done" ? "✓" : item.status === "next" ? "→" : "○"} {item.service}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-text-muted)" }}>
            {item.date}
          </span>
        </div>
      ))}
    </div>
  );
}
