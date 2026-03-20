import { useAppSelector, useAppDispatch } from "../store";
import { updateData, goNext } from "../store/consultationSlice";
import { CalendarGrid } from "../components/CalendarGrid";
import { TimeSlot } from "../components/TimeSlot";
import { CALENDAR_DATA } from "../data/consultation-constants";

export function ConsultCalendarPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const availTimes = data.selectedDate ? (CALENDAR_DATA[data.selectedDate] || []) : [];

  return (
    <div data-part="page-content">
      <div data-part="section-label">BOOK YOUR CONSULT</div>
      <div data-part="section-heading">Pick a Date & Time</div>
      <div data-part="section-sub">
        {data.depositPaid ? "Deposit: $75 · applied to your service" : "Free 15-minute consultation"}
      </div>

      <CalendarGrid
        availability={CALENDAR_DATA}
        selectedDate={data.selectedDate}
        onSelectDate={date => dispatch(updateData({ selectedDate: date, selectedTime: null }))}
      />

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
          {!data.name && (
            <>
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
            </>
          )}
          <button
            data-part="btn-accent"
            onClick={() => dispatch(goNext())}
            disabled={!data.selectedDate || !data.selectedTime}
          >
            {data.depositPaid ? "Pay $75 & Confirm" : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}
