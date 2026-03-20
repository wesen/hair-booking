import type { RedeemableReward } from "../types";

interface RedeemListProps {
  rewards: RedeemableReward[];
  userPoints: number;
  onRedeem?: (cost: number) => void;
}

export function RedeemList({ rewards, userPoints, onRedeem }: RedeemListProps) {
  return (
    <div data-part="redeem-list">
      {rewards.map((r, i) => (
        <div key={i} data-part="redeem-item" data-locked={r.locked || undefined}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span data-part="redeem-cost">{r.cost} pts</span>
            <span>{r.label}</span>
          </div>
          {r.locked ? (
            <span>🔓</span>
          ) : (
            <button
              data-part="btn-outline"
              style={{ padding: "6px 12px", fontSize: 11, width: "auto" }}
              onClick={() => onRedeem?.(r.cost)}
            >
              Redeem
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
