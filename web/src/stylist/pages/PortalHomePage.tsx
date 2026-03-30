import { NextAppointmentCard } from "../components/NextAppointmentCard";
import { LoyaltyBadgeCompact } from "../components/LoyaltyBadgeCompact";
import { MaintenancePlanCard } from "../components/MaintenancePlanCard";
import { getApiErrorMessage, useCancelMyAppointmentMutation, usePortalHomeView } from "../store/api";
import { useState } from "react";
import { AppointmentReschedulePanel } from "../components/AppointmentReschedulePanel";

interface PortalHomePageProps {
  showLoyaltyBadge?: boolean;
}

export function PortalHomePage({ showLoyaltyBadge = true }: PortalHomePageProps) {
  const { user, nextAppointment, maintenance, isLoading, errorMessage } = usePortalHomeView();
  const [cancelMyAppointment] = useCancelMyAppointmentMutation();
  const [showReschedule, setShowReschedule] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          onReschedule={nextAppointment.remoteId && nextAppointment.serviceId ? () => {
            setSubmitError(null);
            setShowReschedule(true);
          } : undefined}
          onCancel={nextAppointment.remoteId ? async () => {
            const appointmentId = nextAppointment.remoteId;
            if (!appointmentId) {
              return;
            }
            setSubmitError(null);
            try {
              await cancelMyAppointment({
                appointmentId,
                body: { reason: "Cancelled from client portal" },
              }).unwrap();
            } catch (error) {
              setSubmitError(getApiErrorMessage(error, "We could not cancel that appointment yet."));
            }
          } : undefined}
        />
      )}

      {nextAppointment && showReschedule ? (
        <AppointmentReschedulePanel
          appointment={nextAppointment}
          onClose={() => setShowReschedule(false)}
        />
      ) : null}

      {submitError ? (
        <div style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 10 }}>
          {submitError}
        </div>
      ) : null}

      {showLoyaltyBadge ? (
        <LoyaltyBadgeCompact
          tier={user.tier}
          tierIcon={tierIcons[user.tier] || "\u{1F949}"}
          points={user.points}
          pointsToNext={user.pointsToNext}
          nextTier={user.nextTier}
        />
      ) : null}

      <MaintenancePlanCard items={maintenance} />

      <button data-part="book-cta">
        {"\u{2728}"} Book Next Appointment
      </button>
    </div>
  );
}
