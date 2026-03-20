import type { Client } from "../types";
import { TierBadge } from "./TierBadge";
import { getTier } from "../utils/loyalty";
import { getAvatarColor, getInitials } from "../utils/avatar";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const tier = getTier(client.points);

  return (
    <div data-part="client-card" onClick={onClick} role="button" tabIndex={0}>
      <div
        data-part="client-avatar"
        style={{ background: getAvatarColor(client.name) }}
      >
        {getInitials(client.name)}
      </div>
      <div data-part="client-info">
        <div data-part="client-name">{client.name}</div>
        <div data-part="client-sub">
          {client.visits} visits · Last: {client.lastVisit?.replace(", 2026", "")}
        </div>
      </div>
      <TierBadge tier={tier} />
    </div>
  );
}
