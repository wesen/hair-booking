import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { updateData, goNext } from "../store/consultationSlice";
import { findConsultService, getApiErrorMessage, useCreateAppointmentMutation, useGetAvailabilityQuery, useGetServicesQuery } from "../store/api";
import { CalendarGrid } from "../components/CalendarGrid";
import { TimeSlot } from "../components/TimeSlot";

export function ConsultCalendarPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const [calendarMonth, setCalendarMonth] = useState(2);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const year = 2026;
  const monthKey = `${year}-${String(calendarMonth + 1).padStart(2, "0")}`;
  const servicesQuery = useGetServicesQuery({ category: "consult" });
  const consultService = findConsultService(servicesQuery.data, data.serviceType);
  const availabilityQuery = useGetAvailabilityQuery(
    {
      month: monthKey,
      serviceId: consultService?.id,
    },
    {
      skip: !consultService,
    },
  );
  const [createAppointment, createAppointmentState] = useCreateAppointmentMutation();
  const availability = availabilityQuery.data ?? {};
  const availTimes = data.selectedDate ? (availability[data.selectedDate] || []) : [];
  const requiresContactDetails = !data.name.trim() || (!data.email.trim() && !data.phone.trim());

  return (
    <div data-part="page-content">
      <div data-part="section-label">BOOK YOUR CONSULT</div>
      <div data-part="section-heading">Pick a Date & Time</div>
      <div data-part="section-sub">
        {data.depositPaid ? "Deposit: $75 · applied to your service" : "Free 15-minute consultation"}
      </div>

      <CalendarGrid
        availability={availability}
        selectedDate={data.selectedDate}
        month={calendarMonth}
        year={year}
        onMonthChange={(nextMonth) => {
          setCalendarMonth(nextMonth);
          dispatch(updateData({ selectedDate: null, selectedTime: null }));
        }}
        onSelectDate={date => dispatch(updateData({ selectedDate: date, selectedTime: null }))}
      />

      {servicesQuery.isLoading || availabilityQuery.isLoading ? (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 14, padding: "16px 0" }}>
          Loading live availability...
        </div>
      ) : null}

      {servicesQuery.error || availabilityQuery.error ? (
        <div style={{ textAlign: "center", color: "var(--color-danger)", fontSize: 13, padding: "8px 0" }}>
          {getApiErrorMessage(servicesQuery.error ?? availabilityQuery.error, "We could not load appointment times.")}
        </div>
      ) : null}

      {data.selectedDate && (
        <>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "var(--color-text)" }}>
            {new Date(data.selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          {availTimes.length > 0 ? (
            <div data-part="time-grid">
              {availTimes.map(t => (
                <TimeSlot
                  key={t}
                  time={t}
                  selected={data.selectedTime === t}
                  onClick={() => dispatch(updateData({ selectedTime: t }))}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 14, padding: "16px 0" }}>
              No slots available this day
            </div>
          )}
        </>
      )}

      {data.selectedDate && data.selectedTime && (
        <div style={{ marginTop: 20 }}>
          <div data-part="form-group">
            <label data-part="form-label">Your name</label>
            <input
              data-part="text-input"
              placeholder="First & last name"
              value={data.name}
              onChange={e => dispatch(updateData({ name: e.target.value }))}
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">Email</label>
            <input
              data-part="text-input"
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={e => dispatch(updateData({ email: e.target.value }))}
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">Phone</label>
            <input
              data-part="text-input"
              type="tel"
              placeholder="(401) 555-0123"
              value={data.phone}
              onChange={e => dispatch(updateData({ phone: e.target.value }))}
            />
          </div>
          <button
            data-part="btn-accent"
            onClick={async () => {
              if (!consultService || !data.selectedDate || !data.selectedTime) {
                return;
              }

              setSubmitError(null);
              try {
                const appointment = await createAppointment({
                  intake_id: data.intakeId || undefined,
                  service_id: consultService.id,
                  date: data.selectedDate,
                  start_time: data.selectedTime,
                  client_name: data.name.trim(),
                  client_email: data.email.trim() || undefined,
                  client_phone: data.phone.trim() || undefined,
                }).unwrap();

                dispatch(updateData({
                  appointmentId: appointment.id,
                  appointmentServiceId: consultService.id,
                }));
                dispatch(goNext());
              } catch (error) {
                setSubmitError(getApiErrorMessage(error, "We could not confirm that time yet."));
              }
            }}
            disabled={!data.selectedDate || !data.selectedTime || !consultService || requiresContactDetails || createAppointmentState.isLoading}
          >
            {data.depositPaid ? "Pay $75 & Confirm" : "Confirm Booking"}
          </button>
          {submitError && (
            <div style={{ marginTop: 12, textAlign: "center", color: "var(--color-danger)", fontSize: 13 }}>
              {submitError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
