import { useMemo, useState } from "react";
import type { AppointmentDetail } from "../types";
import { CalendarGrid } from "./CalendarGrid";
import { TimeSlot } from "./TimeSlot";
import { getApiErrorMessage, useGetAvailabilityQuery, useRescheduleMyAppointmentMutation } from "../store/api";

interface AppointmentReschedulePanelProps {
  appointment: AppointmentDetail;
  onClose: () => void;
}

function getInitialMonth(appointment: AppointmentDetail): number {
  if (!appointment.scheduledDate) {
    return new Date().getMonth();
  }

  const parsed = new Date(`${appointment.scheduledDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getMonth();
  }

  return parsed.getMonth();
}

function getInitialYear(appointment: AppointmentDetail): number {
  if (!appointment.scheduledDate) {
    return new Date().getFullYear();
  }

  const parsed = new Date(`${appointment.scheduledDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getFullYear();
  }

  return parsed.getFullYear();
}

export function AppointmentReschedulePanel({ appointment, onClose }: AppointmentReschedulePanelProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => getInitialMonth(appointment));
  const [calendarYear] = useState(() => getInitialYear(appointment));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rescheduleMyAppointment, rescheduleState] = useRescheduleMyAppointmentMutation();

  const monthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
  const availabilityQuery = useGetAvailabilityQuery(
    {
      month: monthKey,
      serviceId: appointment.serviceId,
    },
    {
      skip: !appointment.serviceId,
    },
  );

  const availability = availabilityQuery.data ?? {};
  const availableTimes = selectedDate ? (availability[selectedDate] || []) : [];
  const currentScheduleLabel = useMemo(() => {
    if (!appointment.date || !appointment.time) {
      return "Current appointment time unavailable";
    }
    return `${appointment.date} at ${appointment.time}`;
  }, [appointment.date, appointment.time]);

  if (!appointment.remoteId || !appointment.serviceId) {
    return (
      <div data-part="profile-section" style={{ marginTop: 12 }}>
        <div data-part="profile-section-title">RESCHEDULE</div>
        <div style={{ fontSize: 13, color: "var(--color-danger)", lineHeight: 1.6 }}>
          We could not prepare rescheduling for this appointment because the backend appointment reference is missing.
        </div>
      </div>
    );
  }

  return (
    <div data-part="profile-section" style={{ marginTop: 12 }}>
      <div data-part="profile-section-title">RESCHEDULE APPOINTMENT</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
        Current time: {currentScheduleLabel}
      </div>

      <CalendarGrid
        availability={availability}
        selectedDate={selectedDate}
        month={calendarMonth}
        year={calendarYear}
        onMonthChange={(nextMonth) => {
          setCalendarMonth(nextMonth);
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setSelectedTime(null);
        }}
      />

      {availabilityQuery.isLoading ? (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 14, padding: "12px 0" }}>
          Loading live availability...
        </div>
      ) : null}

      {availabilityQuery.error ? (
        <div style={{ textAlign: "center", color: "var(--color-danger)", fontSize: 13, padding: "8px 0" }}>
          {getApiErrorMessage(availabilityQuery.error, "We could not load reschedule availability.")}
        </div>
      ) : null}

      {selectedDate ? (
        <>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "var(--color-text)" }}>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          {availableTimes.length > 0 ? (
            <div data-part="time-grid">
              {availableTimes.map((time) => (
                <TimeSlot
                  key={time}
                  time={time}
                  selected={selectedTime === time}
                  onClick={() => setSelectedTime(time)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 14, padding: "12px 0" }}>
              No open slots on this day.
            </div>
          )}
        </>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          data-part="btn-accent"
          disabled={!selectedDate || !selectedTime || rescheduleState.isLoading}
          onClick={async () => {
            if (!selectedDate || !selectedTime) {
              return;
            }

            setSubmitError(null);
            try {
              await rescheduleMyAppointment({
                appointmentId: appointment.remoteId!,
                body: {
                  date: selectedDate,
                  start_time: selectedTime,
                },
              }).unwrap();
              onClose();
            } catch (error) {
              setSubmitError(getApiErrorMessage(error, "We could not reschedule that appointment yet."));
            }
          }}
        >
          {rescheduleState.isLoading ? "Saving..." : "Confirm Reschedule"}
        </button>
        <button
          data-part="profile-action-item"
          style={{ marginTop: 0, flex: "0 0 auto" }}
          disabled={rescheduleState.isLoading}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

      {submitError ? (
        <div style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 10 }}>
          {submitError}
        </div>
      ) : null}
    </div>
  );
}
