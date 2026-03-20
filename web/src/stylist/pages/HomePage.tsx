import { useAppSelector, useAppDispatch } from "../store";
import { setTab } from "../store/uiSlice";
import { setStep } from "../store/bookingSlice";
import { TopBar } from "../components/TopBar";
import { StatBox } from "../components/StatBox";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { AppointmentRow } from "../components/AppointmentRow";

const TODAY = "Mar 19, 2026";

export function HomePage() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector((state) => state.appointments.appointments);
  const clients = useAppSelector((state) => state.clients.clients);

  const todayAppts = appointments.filter((a) => a.date === "Mar 19");
  const upcoming = appointments.filter((a) => a.date !== "Mar 19").slice(0, 4);

  return (
    <div data-part="page-content">
      <div data-part="stagger-1">
        <TopBar title="Good afternoon ☀️" subtitle="Thursday, March 19" />
      </div>

      <div data-part="stagger-2">
        <div data-part="stats-row">
          <StatBox value={todayAppts.length} label="Today" />
          <StatBox value={appointments.length} label="This Week" />
          <StatBox value={clients.length} label="Clients" />
        </div>
      </div>

      <div data-part="stagger-3">
        <Card
          variant="rose"
          onClick={() => {
            dispatch(setTab("book"));
            dispatch(setStep(1));
          }}
          style={{ cursor: "pointer", marginBottom: 20 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32 }}>✂️</div>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600 }}>
                New Booking
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                Tap to schedule a client
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div data-part="stagger-4">
        <SectionTitle icon="clock">Today's Schedule</SectionTitle>
        <Card style={{ marginBottom: 20 }}>
          {todayAppts.length > 0 ? (
            todayAppts.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} />
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                fontSize: 14,
                color: "var(--color-text-muted)",
              }}
            >
              No appointments today — enjoy! 🌿
            </div>
          )}
        </Card>
      </div>

      <div>
        <SectionTitle icon="calendar">Upcoming</SectionTitle>
        <Card>
          {upcoming.length > 0 ? (
            upcoming.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} showDate />
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                fontSize: 14,
                color: "var(--color-text-muted)",
              }}
            >
              No upcoming appointments
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
