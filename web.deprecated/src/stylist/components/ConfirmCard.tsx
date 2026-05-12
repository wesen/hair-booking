import { Icon } from "./Icon";
import type { IconName } from "../types";

interface DetailRow {
  icon: IconName;
  text: string;
}

interface ConfirmCardProps {
  title?: string;
  subtitle?: string;
  details: DetailRow[];
}

export function ConfirmCard({ title = "You're All Set", subtitle = "Confirmation sent to your email", details }: ConfirmCardProps) {
  return (
    <div data-part="confirm-card">
      <div data-part="confirm-check">
        <Icon name="check" size={28} />
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)" }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 4, marginBottom: 20 }}>
        {subtitle}
      </div>
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, textAlign: "left" }}>
        {details.map((d, i) => (
          <div key={i} data-part="confirm-detail-row">
            <Icon name={d.icon} size={16} />
            <span>{d.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
