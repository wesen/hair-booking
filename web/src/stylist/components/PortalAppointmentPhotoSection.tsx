import type { AppointmentDetail } from "../types";
import { mapAppointmentPhotosToPhotoEntry, useGetMyAppointmentQuery } from "../store/api";
import { PhotoTimelineEntry } from "./PhotoTimelineEntry";

interface PortalAppointmentPhotoSectionProps {
  appointment: AppointmentDetail;
}

export function PortalAppointmentPhotoSection({ appointment }: PortalAppointmentPhotoSectionProps) {
  const appointmentId = appointment.remoteId ?? "";
  const query = useGetMyAppointmentQuery(appointmentId, { skip: appointmentId === "" });

  if (appointmentId === "" || query.isLoading || query.error || !query.data) {
    return null;
  }

  if (query.data.photos.length === 0) {
    return null;
  }

  const photoEntry = mapAppointmentPhotosToPhotoEntry(query.data.appointment, query.data.photos);
  if (!photoEntry.beforeUrl && !photoEntry.afterUrl) {
    return null;
  }

  return (
    <div style={{ marginTop: 10 }}>
      <PhotoTimelineEntry entry={photoEntry} />
    </div>
  );
}
