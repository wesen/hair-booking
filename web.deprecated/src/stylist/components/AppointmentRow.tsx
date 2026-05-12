import type { Appointment } from "../types";
import { StatusBadge } from "./StatusBadge";

interface AppointmentRowProps {
  appointment: Appointment;
  showDate?: boolean;
}

export function AppointmentRow({ appointment, showDate }: AppointmentRowProps) {
  return (
    <div data-part="appt-row">
      <div data-part="appt-time">
        {showDate && <>{appointment.date?.replace(", 2026", "")}<br /></>}
        {appointment.time}
      </div>
      <div data-part="appt-info">
        <div data-part="appt-client">{appointment.client}</div>
        <div data-part="appt-service">{appointment.service}</div>
      </div>
      <StatusBadge status={appointment.status} />
    </div>
  );
}
