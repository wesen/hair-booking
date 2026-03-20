import { ProgressBar } from "./ProgressBar";

interface TierCardProps {
  tier: string;
  tierIcon: string;
  points: number;
  pointsToNext: number;
  nextTier: string | null;
  perks: string[];
}

export function TierCard({ tier, tierIcon, points, pointsToNext, nextTier, perks }: TierCardProps) {
  const maxPoints = points + pointsToNext;
  const progress = nextTier ? (points / maxPoints) * 100 : 100;

  return (
    <div data-part="tier-card">
      <div style={{ fontSize: 28 }}>{tierIcon}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, marginTop: 4 }}>
        {tier} Member
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, color: "var(--color-accent-dark)", margin: "8px 0" }}>
        {points} points
      </div>
      <ProgressBar progress={progress} color="var(--color-gold)" gradientTo="var(--color-accent)" />
      {nextTier && (
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
          {pointsToNext} points to {nextTier}
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
        {perks.map((p, i) => <div key={i}>{p}</div>)}
      </div>
    </div>
  );
}
