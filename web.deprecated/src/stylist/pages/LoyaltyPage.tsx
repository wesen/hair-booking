import { useAppDispatch } from "../store";
import { openReferralModal } from "../store/uiSlice";
import { TopBar } from "../components/TopBar";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { RewardItem } from "../components/RewardItem";
import { Button } from "../components/Button";
import { LOYALTY_TIERS, REWARDS } from "../data/constants";

export function LoyaltyPage() {
  const dispatch = useAppDispatch();

  return (
    <div data-part="page-content">
      <TopBar title="Loyalty & Rewards" />

      {/* Tiers overview */}
      <Card variant="rose" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, marginBottom: 14 }}>
          Loyalty Tiers
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {LOYALTY_TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>{tier.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: tier.color, fontSize: 14 }}>{tier.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{tier.range}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* How it works */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
          How It Works
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--color-text-secondary)" }}>
          <div>💰 Earn 40% of service price as points</div>
          <div>🎁 Referral bonuses for you and your friend</div>
          <div>⭐ Silver+ members get 10% off all services</div>
          <div>🥇 Gold+ members get 15% off + free conditioning</div>
          <div>💎 Diamond members get 20% off + priority booking</div>
        </div>
      </Card>

      {/* Rewards menu */}
      <SectionTitle icon="gift">Rewards Menu</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        {REWARDS.map((reward) => (
          <RewardItem key={reward.pts} pts={reward.pts} name={reward.name} desc={reward.desc} />
        ))}
      </Card>

      {/* Referral button */}
      <Button
        variant="primary"
        onClick={() => dispatch(openReferralModal())}
        style={{ width: "100%" }}
      >
        🎁 Log a Referral
      </Button>
    </div>
  );
}
