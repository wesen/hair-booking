import type { Appointment } from "../types";

interface StatusBadgeProps {
  status: Appointment["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span data-part="status-badge" data-status={status}>
      {status}
    </span>
  );
}
