import type { AppointmentDetail } from "../types";

interface PortalAppointmentCardProps {
  appointment: AppointmentDetail;
  onReschedule?: () => void;
  onCancel?: () => void;
  onViewReceipt?: () => void;
}

export function PortalAppointmentCard({ appointment, onReschedule, onCancel, onViewReceipt }: PortalAppointmentCardProps) {
  const isPast = appointment.status === "complete" || appointment.status === "cancelled";
  const statusLabel = appointment.status.toUpperCase();

  return (
    <div data-part="appt-card">
      <div data-part="appt-card-header">
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{appointment.service}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {appointment.time} · {appointment.duration}
          </div>
          <div style={{ fontSize: 14, fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--color-accent-dark)", marginTop: 4 }}>
            ${appointment.price}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "right" }}>
            {appointment.date.replace(", 2026", "")}
          </div>
          <span data-part="status-badge" data-status={appointment.status === "complete" ? "confirmed" : appointment.status}>
            {statusLabel}
          </span>
        </div>
      </div>

      {appointment.review && (
        <div style={{ marginTop: 8 }}>
          <div data-part="review-stars">
            {"⭐".repeat(appointment.review.stars)}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", marginTop: 2 }}>
            "{appointment.review.text}"
          </div>
        </div>
      )}

      <div data-part="appt-card-actions">
        {!isPast && onReschedule && (
          <button data-part="btn-outline" style={{ padding: "8px 14px", fontSize: 12 }} onClick={onReschedule}>
            Reschedule
          </button>
        )}
        {!isPast && onCancel && (
          <button data-part="btn-outline" style={{ padding: "8px 14px", fontSize: 12, color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={onCancel}>
            Cancel
          </button>
        )}
        {isPast && onViewReceipt && (
          <button data-part="btn-outline" style={{ padding: "8px 14px", fontSize: 12 }} onClick={onViewReceipt}>
            View Receipt
          </button>
        )}
      </div>
    </div>
  );
}
