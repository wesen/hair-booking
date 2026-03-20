import { useAppSelector } from "../store";
import { NextAppointmentCard } from "../components/NextAppointmentCard";
import { LoyaltyBadgeCompact } from "../components/LoyaltyBadgeCompact";
import { MaintenancePlanCard } from "../components/MaintenancePlanCard";
import { usePortalHomeView } from "../store/api";

export function PortalHomePage() {
  const rewardsUser = useAppSelector(s => s.portal.user);
  const { user, nextAppointment, maintenance, isLoading, errorMessage } = usePortalHomeView();

  if (isLoading) {
    return (
      <div data-part="page-content">
        <div data-part="greeting">Loading your portal...</div>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div data-part="page-content">
        <div data-part="section-heading" style={{ marginBottom: 8 }}>Client Portal</div>
        <div style={{ fontSize: 14, color: "var(--color-danger)", lineHeight: 1.7 }}>
          {errorMessage ?? "We could not load your portal summary yet."}
        </div>
      </div>
    );
  }

  const loyaltyUser = {
    ...rewardsUser,
    name: user.name,
    email: user.email,
    phone: user.phone,
    since: user.since,
    initials: user.initials,
    serviceDescription: user.serviceDescription,
  };
  const firstName = user.name.split(" ")[0];
  const tierIcons: Record<string, string> = { Bronze: "\u{1F949}", Silver: "\u{1F948}", Gold: "\u{1F947}", Diamond: "\u{1F48E}" };

  return (
    <div data-part="page-content">
      <div data-part="greeting">Hi, {firstName} {"\u{2600}\u{FE0F}"}</div>

      {nextAppointment && (
        <NextAppointmentCard
          service={nextAppointment.service}
          date={nextAppointment.date.replace(", 2026", "")}
          time={nextAppointment.time}
        />
      )}

      <LoyaltyBadgeCompact
        tier={loyaltyUser.tier}
        tierIcon={tierIcons[loyaltyUser.tier] || "\u{1F949}"}
        points={loyaltyUser.points}
        pointsToNext={loyaltyUser.pointsToNext}
        nextTier={loyaltyUser.nextTier}
      />

      <MaintenancePlanCard items={maintenance} />

      <button data-part="book-cta">
        {"\u{2728}"} Book Next Appointment
      </button>
    </div>
  );
}
