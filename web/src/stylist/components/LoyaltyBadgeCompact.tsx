import { ProgressBar } from "./ProgressBar";

interface LoyaltyBadgeCompactProps {
  tier: string;
  tierIcon: string;
  points: number;
  pointsToNext: number;
  nextTier: string | null;
}

export function LoyaltyBadgeCompact({ tier, tierIcon, points, pointsToNext, nextTier }: LoyaltyBadgeCompactProps) {
  const maxPoints = points + pointsToNext;
  const progress = nextTier ? (points / maxPoints) * 100 : 100;

  return (
    <div data-part="loyalty-badge">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 20 }}>{tierIcon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{tier}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>tier</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--color-accent-dark)" }}>
          {points} pts
        </div>
        <ProgressBar progress={progress} color="var(--color-gold)" gradientTo="var(--color-accent)" />
        {nextTier && (
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
            {pointsToNext} to 💎
          </div>
        )}
      </div>
    </div>
  );
}
