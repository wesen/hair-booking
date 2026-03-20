import type { PointsHistoryItem } from "../types";

interface PointsHistoryListProps {
  items: PointsHistoryItem[];
}

export function PointsHistoryList({ items }: PointsHistoryListProps) {
  return (
    <div data-part="points-history">
      {items.map((item, i) => (
        <div key={i} data-part="points-row">
          <span>{item.date}</span>
          <span style={{ flex: 1, marginLeft: 12 }}>{item.label}</span>
          <span style={{ fontWeight: 600, color: "var(--color-success)" }}>+{item.points}</span>
        </div>
      ))}
    </div>
  );
}
