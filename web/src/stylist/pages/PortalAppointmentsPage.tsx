import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { setAppointmentFilter } from "../store/portalSlice";
import { SegmentToggle } from "../components/SegmentToggle";
import { PortalAppointmentCard } from "../components/PortalAppointmentCard";
import { getApiErrorMessage, useCancelMyAppointmentMutation, usePortalAppointmentsView } from "../store/api";

export function PortalAppointmentsPage() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(s => s.portal.appointmentFilter);
  const { appointments, isLoading, errorMessage } = usePortalAppointmentsView(filter);
  const [cancelMyAppointment] = useCancelMyAppointmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <div data-part="page-content">
      <div data-part="section-heading" style={{ marginBottom: 16 }}>Appointments</div>

      <SegmentToggle
        options={["Upcoming", "Past"]}
        active={filter === "upcoming" ? "Upcoming" : "Past"}
        onChange={v => dispatch(setAppointmentFilter(v === "Upcoming" ? "upcoming" : "past"))}
      />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          Loading {filter} appointments...
        </div>
      ) : errorMessage ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-danger)", fontSize: 14 }}>
          {errorMessage}
        </div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          No {filter} appointments
        </div>
      ) : (
        appointments.map(a => (
          <PortalAppointmentCard
            key={a.id}
            appointment={a}
            onCancel={filter === "upcoming" && a.remoteId ? async () => {
              const appointmentId = a.remoteId;
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
        ))
      )}

      {submitError ? (
        <div style={{ textAlign: "center", marginTop: 12, color: "var(--color-danger)", fontSize: 13 }}>
          {submitError}
        </div>
      ) : null}

      <button data-part="book-cta" style={{ marginTop: 8 }}>
        {"\u{2728}"} Book New Appointment
      </button>
    </div>
  );
}
