import { useAppSelector, useAppDispatch } from "../store";
import {
  setStep,
  nextStep,
  prevStep,
  selectService,
  selectDate,
  selectTime,
  setClientInfo,
  resetBooking,
} from "../store/bookingSlice";
import { addAppointment } from "../store/appointmentsSlice";
import { addBookingPoints } from "../store/clientsSlice";
import { setTab, showToast } from "../store/uiSlice";
import { TopBar } from "../components/TopBar";
import { BookingProgress } from "../components/BookingProgress";
import { SectionTitle } from "../components/SectionTitle";
import { ServiceOption } from "../components/ServiceOption";
import { DateCell } from "../components/DateCell";
import { TimeSlot } from "../components/TimeSlot";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";
import { SERVICES, TIME_SLOTS } from "../data/constants";

function generateDates(): { label: string; num: number; full: string }[] {
  const days: { label: string; num: number; full: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 14; i++) {
    const d = new Date(2026, 2, 20 + i); // Mar 20, 2026 + i
    days.push({
      label: dayNames[d.getDay()],
      num: d.getDate(),
      full: `${monthNames[d.getMonth()]} ${d.getDate()}`,
    });
  }
  return days;
}

const DATES = generateDates();

export function BookingPage() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.booking.step);
  const data = useAppSelector((state) => state.booking.data);
  const clients = useAppSelector((state) => state.clients.clients);

  const handleBack = () => {
    if (step <= 1) {
      dispatch(resetBooking());
      dispatch(setTab("home"));
    } else {
      dispatch(prevStep());
    }
  };

  const handleConfirm = () => {
    if (!data.service || !data.date || !data.time || !data.clientName) return;

    dispatch(
      addAppointment({
        client: data.clientName,
        service: data.service.name,
        date: data.date,
        time: data.time,
        status: "pending",
      })
    );

    const existingClient = clients.find((c) => c.name === data.clientName);
    if (existingClient) {
      dispatch(
        addBookingPoints({
          clientName: data.clientName,
          servicePrice: data.service.price,
          upcoming: `${data.date} at ${data.time}`,
        })
      );
    }

    dispatch(resetBooking());
    dispatch(setTab("schedule"));
    dispatch(showToast("Appointment booked! ✨"));
  };

  return (
    <div data-part="page-content">
      <TopBar
        left={
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon name="back" size={20} />
          </button>
        }
        title="New Booking"
      />

      <BookingProgress currentStep={step} totalSteps={4} />

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div>
          <SectionTitle>Choose a Service</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SERVICES.map((svc) => (
              <ServiceOption
                key={svc.id}
                service={svc}
                selected={data.service?.id === svc.id}
                onClick={() => dispatch(selectService(svc))}
              />
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <Button
              variant="primary"
              disabled={!data.service}
              onClick={() => dispatch(nextStep())}
              style={{ width: "100%" }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div>
          <SectionTitle>Pick a Date</SectionTitle>
          <div data-part="date-selector" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 20 }}>
            {DATES.map((d) => (
              <DateCell
                key={d.full}
                dayLabel={d.label}
                dayNum={d.num}
                selected={data.date === d.full}
                onClick={() => dispatch(selectDate(d.full))}
              />
            ))}
          </div>

          {data.date && (
            <>
              <SectionTitle>Pick a Time</SectionTitle>
              <div data-part="time-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {TIME_SLOTS.map((t) => (
                  <TimeSlot
                    key={t}
                    time={t}
                    selected={data.time === t}
                    onClick={() => dispatch(selectTime(t))}
                  />
                ))}
              </div>
            </>
          )}

          <Button
            variant="primary"
            disabled={!data.date || !data.time}
            onClick={() => dispatch(nextStep())}
            style={{ width: "100%" }}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 3: Client Info */}
      {step === 3 && (
        <div>
          <SectionTitle>Client Info</SectionTitle>

          {/* Quick select existing clients */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  dispatch(setClientInfo({ clientName: c.name, clientPhone: c.phone }))
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: data.clientName === c.name ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  background: data.clientName === c.name ? "var(--color-accent-light)" : "var(--color-surface)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text)",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "var(--color-text-muted)",
              margin: "12px 0",
            }}
          >
            — or —
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <Input
              placeholder="Client name"
              value={data.clientName ?? ""}
              onChange={(e) => dispatch(setClientInfo({ clientName: e.target.value }))}
            />
            <Input
              icon={<Icon name="phone" size={14} />}
              placeholder="Phone number"
              value={data.clientPhone ?? ""}
              onChange={(e) => dispatch(setClientInfo({ clientPhone: e.target.value }))}
            />
            <Input
              icon={<Icon name="note" size={14} />}
              placeholder="Notes (optional)"
              value={data.notes ?? ""}
              onChange={(e) => dispatch(setClientInfo({ notes: e.target.value }))}
            />
          </div>

          <Button
            variant="primary"
            disabled={!data.clientName}
            onClick={() => dispatch(nextStep())}
            style={{ width: "100%" }}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <SectionTitle>Confirm Booking</SectionTitle>

          {data.service && (
            <Card variant="rose" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>{data.service.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{data.service.name}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                    {data.service.duration} · ${data.service.price}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Client</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{data.clientName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Date</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{data.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Time</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{data.time}</span>
              </div>
              {data.notes && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Notes</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{data.notes}</span>
                </div>
              )}
            </div>
          </Card>

          <Button
            variant="primary"
            onClick={handleConfirm}
            style={{ width: "100%" }}
          >
            Confirm Booking
          </Button>
        </div>
      )}
    </div>
  );
}
