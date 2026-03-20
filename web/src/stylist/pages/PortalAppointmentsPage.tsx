import { useAppSelector, useAppDispatch } from "../store";
import { setAppointmentFilter } from "../store/portalSlice";
import { SegmentToggle } from "../components/SegmentToggle";
import { PortalAppointmentCard } from "../components/PortalAppointmentCard";
import { usePortalAppointmentsView } from "../store/api";

export function PortalAppointmentsPage() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(s => s.portal.appointmentFilter);
  const { appointments, isLoading, errorMessage } = usePortalAppointmentsView(filter);

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
          />
        ))
      )}

      <button data-part="book-cta" style={{ marginTop: 8 }}>
        {"\u{2728}"} Book New Appointment
      </button>
    </div>
  );
}
