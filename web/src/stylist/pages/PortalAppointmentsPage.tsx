import { useAppSelector, useAppDispatch } from "../store";
import { setAppointmentFilter, cancelAppointment } from "../store/portalSlice";
import { SegmentToggle } from "../components/SegmentToggle";
import { PortalAppointmentCard } from "../components/PortalAppointmentCard";

export function PortalAppointmentsPage() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(s => s.portal.appointments);
  const filter = useAppSelector(s => s.portal.appointmentFilter);

  const upcoming = appointments.filter(a => a.status === "confirmed" || a.status === "pending");
  const past = appointments.filter(a => a.status === "complete" || a.status === "cancelled");
  const filtered = filter === "upcoming" ? upcoming : past;

  return (
    <div data-part="page-content">
      <div data-part="section-heading" style={{ marginBottom: 16 }}>Appointments</div>

      <SegmentToggle
        options={["Upcoming", "Past"]}
        active={filter === "upcoming" ? "Upcoming" : "Past"}
        onChange={v => dispatch(setAppointmentFilter(v === "Upcoming" ? "upcoming" : "past"))}
      />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          No {filter} appointments
        </div>
      ) : (
        filtered.map(a => (
          <PortalAppointmentCard
            key={a.id}
            appointment={a}
            onReschedule={() => {}}
            onCancel={() => dispatch(cancelAppointment(a.id))}
            onViewReceipt={() => {}}
          />
        ))
      )}

      <button data-part="book-cta" style={{ marginTop: 8 }}>
        {"\u{2728}"} Book New Appointment
      </button>
    </div>
  );
}
