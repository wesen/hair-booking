import { Icon } from "./Icon";

interface ServiceCardProps {
  title: string;
  description: string;
  emoji: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
}

export function ServiceCard({ title, description, emoji, gradientFrom = "#f5e6d8", gradientTo = "#eddcd0", onClick }: ServiceCardProps) {
  return (
    <div data-part="svc-card" onClick={onClick} role="button" tabIndex={0}>
      <div
        data-part="svc-icon"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div data-part="svc-card-title">{title}</div>
        <div data-part="svc-card-desc">{description}</div>
      </div>
      <Icon name="chevRight" size={18} />
    </div>
  );
}
