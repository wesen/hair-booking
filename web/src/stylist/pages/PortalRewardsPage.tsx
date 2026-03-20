import { useAppSelector, useAppDispatch } from "../store";
import { redeemReward } from "../store/portalSlice";
import { TierCard } from "../components/TierCard";
import { RedeemList } from "../components/RedeemList";
import { ReferralCard } from "../components/ReferralCard";
import { PointsHistoryList } from "../components/PointsHistoryList";

export function PortalRewardsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.portal.user);
  const redeemable = useAppSelector(s => s.portal.redeemable);
  const pointsHistory = useAppSelector(s => s.portal.pointsHistory);
  const tierIcons: Record<string, string> = { Bronze: "\u{1F949}", Silver: "\u{1F948}", Gold: "\u{1F947}", Diamond: "\u{1F48E}" };

  return (
    <div data-part="page-content">
      <div data-part="section-heading" style={{ marginBottom: 16 }}>Rewards</div>

      <TierCard
        tier={user.tier}
        tierIcon={tierIcons[user.tier] || "\u{1F949}"}
        points={user.points}
        pointsToNext={user.pointsToNext}
        nextTier={user.nextTier}
        perks={user.perks}
      />

      <div data-part="section-label">REDEEM</div>
      <RedeemList
        rewards={redeemable}
        userPoints={user.points}
        onRedeem={cost => dispatch(redeemReward(cost))}
      />

      <ReferralCard
        code={user.referralCode}
        discount="$25 off for you & them"
        referralCount={user.referralCount}
      />

      <div data-part="section-label">POINTS HISTORY</div>
      <PointsHistoryList items={pointsHistory} />
    </div>
  );
}
