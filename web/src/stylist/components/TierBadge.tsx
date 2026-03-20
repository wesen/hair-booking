import type { LoyaltyTier } from "../types";

interface TierBadgeProps {
  tier: LoyaltyTier;
  showLabel?: boolean;
}

export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  return (
    <span
      data-part="tier-badge"
      style={{ background: `${tier.color}22`, color: tier.color }}
    >
      {tier.icon} {showLabel && tier.name}
    </span>
  );
}
