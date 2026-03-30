interface NextAppointmentCardProps {
  service: string;
  date: string;
  time: string;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function NextAppointmentCard({ service, date, time, onReschedule, onCancel }: NextAppointmentCardProps) {
  return (
    <div data-part="next-appt-card">
      <div data-part="section-label">⚡ NEXT APPOINTMENT</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "var(--color-text)" }}>
        {service}
      </div>
      <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4 }}>
        {date} · {time}
      </div>
      <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 14, paddingTop: 12, display: "flex", gap: 8 }}>
        {onReschedule ? (
          <button data-part="btn-outline" style={{ flex: 1, padding: "10px 12px", fontSize: 13 }} onClick={onReschedule}>
            Reschedule
          </button>
        ) : null}
        {onCancel ? (
          <button data-part="btn-outline" style={{ flex: 1, padding: "10px 12px", fontSize: 13, color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
