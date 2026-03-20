import { useAppSelector, useAppDispatch } from "../store";
import { goToProfile, cancelAppointment } from "../store/portalSlice";
import { PortalTopBar } from "../components/PortalTopBar";
import { NextAppointmentCard } from "../components/NextAppointmentCard";
import { LoyaltyBadgeCompact } from "../components/LoyaltyBadgeCompact";
import { MaintenancePlanCard } from "../components/MaintenancePlanCard";

export function PortalHomePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.portal.user);
  const appointments = useAppSelector(s => s.portal.appointments);
  const maintenance = useAppSelector(s => s.portal.maintenance);

  const nextAppt = appointments.find(a => a.status === "confirmed" || a.status === "pending");
  const firstName = user.name.split(" ")[0];
  const tierIcons: Record<string, string> = { Bronze: "\u{1F949}", Silver: "\u{1F948}", Gold: "\u{1F947}", Diamond: "\u{1F48E}" };

  return (
    <div data-part="page-content">
      <div data-part="greeting">Hi, {firstName} {"\u{2600}\u{FE0F}"}</div>

      {nextAppt && (
        <NextAppointmentCard
          service={nextAppt.service}
          date={nextAppt.date.replace(", 2026", "")}
          time={nextAppt.time}
          onCancel={() => dispatch(cancelAppointment(nextAppt.id))}
        />
      )}

      <LoyaltyBadgeCompact
        tier={user.tier}
        tierIcon={tierIcons[user.tier] || "\u{1F949}"}
        points={user.points}
        pointsToNext={user.pointsToNext}
        nextTier={user.nextTier}
      />

      <MaintenancePlanCard items={maintenance} />

      <button data-part="book-cta">
        {"\u{2728}"} Book Next Appointment
      </button>
    </div>
  );
}
